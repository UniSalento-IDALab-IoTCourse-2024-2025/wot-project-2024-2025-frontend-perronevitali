# FARO: App mobile React Native

## Descrizione del progetto
Il controllo della sicurezza negli ambienti industriali in cui vengono stoccate e movimentate sostanze pericolose rappresenta una delle sfide più delicate nella gestione degli impianti. Con l'aumento della complessità delle operazioni quotidiane, diventa fondamentale disporre di un supporto oggettivo che permetta di valutare in tempo reale se una determinata combinazione di attività concomitanti generi una condizione di rischio.

Per rispondere a questa esigenza è stato sviluppato **FARO** (Framework di Allerta e Rilevamento Operativo), un sistema che realizza un **Digital Twin** dell'area di stoccaggio: una rappresentazione virtuale costantemente sincronizzata con lo stato fisico dell'impianto. FARO integra tre componenti complementari: il monitoraggio ambientale tramite sensori collegati a un Raspberry Pi in ciascuna zona, il tracciamento della posizione e delle autorizzazioni del personale tramite beacon BLE rilevati dall'app mobile, e un modulo di pianificazione delle operazioni che, prima di autorizzare una nuova attività, ne valuta il rischio combinando una formula quantitativa consolidata in letteratura con un modello di Machine Learning. L'obiettivo comune di queste componenti è rispondere, in ogni istante, alla domanda: **è sicuro autorizzare questa operazione, in questa zona, adesso?**

---

## Architettura del sistema
FARO è organizzato secondo un'architettura a microservizi, in cui ciascun componente comunica con gli altri tramite API REST per le richieste sincrone e tramite RabbitMQ per gli eventi asincroni (AMQP tra microservizi, STOMP verso l'app mobile, MQTT per la diffusione degli allarmi d'area). Le principali componenti in cui si articola il sistema sono:

#### UserService
Microservizio Quarkus responsabile della gestione degli utenti (lavoratori e amministratori), dell'autenticazione JWT e della gestione delle code di messaggistica personale di ciascun utente.

#### OperationalService
Microservizio Quarkus responsabile della gestione delle aree, degli item, delle sostanze pericolose e della pianificazione delle task, oltre all'orchestrazione della doppia valutazione del rischio (formula + Machine Learning).

#### MLService
Servizio FastAPI che espone il modello di Machine Learning per la classificazione del rischio delle task e genera, tramite un LLM locale (Ollama), una spiegazione testuale del verdetto.

#### EdgeService
Servizio FastAPI deployato sul Raspberry Pi presente in ogni area, responsabile dell'acquisizione delle misurazioni ambientali dal sensore DHT11 e della diffusione degli allarmi.

#### App mobile React Native *(repository corrente)*
Applicazione sviluppata con React Native ed Expo che consente a lavoratori e amministratori di autenticarsi, tracciare automaticamente la propria posizione tramite beacon BLE, pianificare/evadere le task e ricevere notifiche in tempo reale.

#### RabbitMQ
Message broker che gestisce sia la messaggistica AMQP interna tra microservizi sia i protocolli STOMP e MQTT (tramite i relativi plugin) usati rispettivamente dall'app mobile per la coda personale e per la diffusione degli allarmi d'area con meccanismo di *retain*.

---

Di seguito viene fornita una descrizione dettagliata della componente implementata nella repository corrente.

## App mobile React Native

### Panoramica
L'applicazione mobile è stata sviluppata con **React Native** e i servizi di building offerti da **Expo** (in particolare Expo Router per la navigazione file-based). Rappresenta il punto di contatto diretto tra il sistema e i due attori (lavoratore e amministratore) realizzando lato client il tracciamento automatico del personale, la pianificazione/evasione delle task e la notifica tempestiva degli stati di pericolo. Attraverso l'app, gli utenti possono vedere e tenere aggiornata la propria posizione all'interno dell'area di stoccaggio in tempo reale, consultare i messaggi ricevuti, vedere e assegnare le task, e ricevere le notifiche relative agli allarmi e alle attività assegnate.

### Navigazione basata sul ruolo
La navigazione è organizzata tramite **Expo Router** con route group distinti per ciascun ruolo:
- `(admin)/`: dashboard dell'amministratore (`index.tsx`), gestione inventario (`inventory.tsx`), task (`tasks.tsx`), messaggi (`message.tsx`), profilo (`profile.tsx`);
- `(worker)/`: home del lavoratore (`index.tsx`), attività assegnate (`works.tsx`), messaggi (`message.tsx`), profilo (`profile.tsx`);
- `login.tsx` / `index.tsx` / `modal.tsx`: schermate pubbliche di accesso e componenti condivisi.

Le sezioni `area/`, `item/`, `user/` raccolgono le schermate di gestione riservate all'amministratore (creazione/modifica/eliminazione area, configurazione soglie, gestione item e deposito, gestione utenti e lavoratori), mentre `activity/` raccoglie tutte le schermate relative all'esecuzione delle diverse tipologie di task (carico/scarico, ispezione, manutenzione, valutazione, storico) lato lavoratore.

### Posizione in tempo reale degli utenti
Ogni beacon installato nelle aree dell'impianto trasmette continuamente in broadcast un pacchetto **BLE** contenente il proprio indirizzo MAC, senza richiedere alcuna connessione tra dispositivo e smartphone. L'applicazione, tramite la libreria `react-native-ble-plx`, resta costantemente in ascolto di questi pacchetti: dopo il login, con il Bluetooth attivo, l'app avvia una scansione passiva confrontando il MAC di ciascun pacchetto ricevuto con i MAC delle aree presenti nel database. È l'app stessa a determinare autonomamente a quale area appartenere: quando rileva per la prima volta un beacon noto, invia un messaggio `POSITION_UPDATE` verso il backend, che aggiorna di conseguenza la posizione dell'utente, senza alcuna azione esplicita da parte dell'operatore.

Quando l'utente si sposta tra aree, l'app continua per un certo intervallo a ricevere pacchetti da più beacon contemporaneamente: per stabilire l'area effettivamente più vicina, confronta la potenza del segnale (RSSI) ricevuto in quel momento con l'ultimo ricevuto. Solo quando il segnale appartiene a un'area diversa e ha potenza maggiore rispetto al precedente viene inviato un nuovo `POSITION_UPDATE`, aggiornando la posizione registrata sul backend.

### Gestione dei messaggi in tempo reale
Per comunicare con il broker RabbitMQ, l'applicazione utilizza due client distinti, ciascuno dedicato a un canale diverso:
- **`@stomp/stompjs`** (protocollo STOMP su WebSocket): gestisce la coda personale dell'utente. Appena eseguito il login, l'app stabilisce una connessione WebSocket con il broker e si sottoscrive alle proprie code personali (`faro.inbox.{userId}` / `faro.outbox.{userId}`), una per inviare messaggi (aggiornamenti di posizione) e l'altra per riceverli (task assegnate); ogni messaggio ricevuto genera una notifica visibile sul telefono;
- **`react-native-paho-mqtt`** (protocollo MQTT su WebSocket): gestisce la sottoscrizione al topic dell'area in cui l'utente si trova. Quando un utente si sposta da un'area all'altra, oltre all'aggiornamento di posizione, l'app si sottoscrive al topic MQTT della nuova area e si disiscrive da quello dell'area precedente, ricevendo così, grazie al meccanismo di *retain* implementato da *EdgeService*, lo stato di pericolo corrente dell'area anche se pubblicato prima del proprio arrivo.

Al logout, entrambe le connessioni (STOMP e MQTT) vengono chiuse.

### Notifiche push
L'integrazione con **Firebase** (Google Services) e la libreria `expo-notifications` consente di ricevere notifiche anche quando l'app è in background, senza necessità di tenerla aperta. Il token Expo generato per ciascun dispositivo viene salvato lato backend (*UserService*), che lo utilizza per l'invio delle notifiche push relative ad allarmi e assegnazioni di task.

### Persistenza locale della sessione
La libreria `@react-native-async-storage/async-storage` viene utilizzata per mantenere salvati i dati della sessione (token JWT, ruolo, area corrente) e condividerli tra le varie schermate dell'applicazione.

### Struttura del progetto
```
app/
├── (admin)/                # Dashboard, inventario, task, messaggi, profilo dell'amministratore
├── (worker)/               # Home, attività, messaggi, profilo del lavoratore
├── activity/                # Schermate di esecuzione delle task (carico/scarico, ispezione, manutenzione, valutazione, storico)
│   ├── loading/               # Carico in deposito / carico item
│   └── unloading/              # Scarico in deposito / scarico item
├── area/                    # Creazione, modifica, eliminazione area, soglie, storico messaggi
├── item/                    # Creazione/modifica item, aggiornamento deposito
├── user/                    # Gestione utenti, lavoratori e amministratori (solo Admin)
├── login.tsx / index.tsx / modal.tsx / _layout.tsx
hooks/
├── use-stomp.tsx            # Client STOMP per la coda personale
├── beacon-service.tsx        # Scansione BLE dei beacon e determinazione dell'area corrente
├── stompClient.tsx           # Configurazione della connessione STOMP
├── use-color-scheme(.web).ts # Gestione del tema chiaro/scuro
└── use-theme-color.ts
```

### Tecnologie
- **React Native 0.81** + **React 19**, con **Expo SDK 54** ed **Expo Router** (navigazione file-based, route tipizzate);
- **TypeScript**;
- **`@stomp/stompjs`**: protocollo STOMP su WebSocket per la coda personale dell'utente;
- **`react-native-paho-mqtt`**: protocollo MQTT su WebSocket per la sottoscrizione ai topic d'area con supporto ai messaggi *retained*;
- **`react-native-ble-plx`**: interazione con il Bluetooth dello smartphone per il rilevamento dei beacon BLE;
- **`expo-notifications`** + **Firebase**: gestione delle notifiche push in foreground e background;
- **`@react-native-async-storage/async-storage`**: persistenza locale dei dati di sessione;
- **`react-native-paper`** / **`react-native-elements`** / **`react-native-dropdown-select-list`**: componenti UI.
