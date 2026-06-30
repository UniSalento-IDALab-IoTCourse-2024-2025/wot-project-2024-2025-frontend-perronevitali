"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringSyncInterval = exports.monitoringEnabled = exports.forceScanConfiguration = exports.activityCheckConfiguration = exports.scanPeriod = exports.scanMode = exports.SECURE_PROFILE = exports.EDDYSTONE = exports.IBEACON = void 0;
exports.IBEACON = 'IBEACON';
exports.EDDYSTONE = 'EDDYSTONE';
exports.SECURE_PROFILE = 'SECURE_PROFILE';
exports.scanMode = {
    LOW_POWER: 0,
    BALANCED: 1,
    LOW_LATENCY: 2,
};
exports.scanPeriod = {
    RANGING: 'RANGING',
    MONITORING: 'MONITORING',
    // Default values equal configuration MONITORING
    create: ({ activePeriod = 8000, passivePeriod = 30000 }) => ({
        activePeriod,
        passivePeriod,
    }),
};
exports.activityCheckConfiguration = {
    DISABLED: 'DISABLED',
    MINIMAL: 'MINIMAL',
    DEFAULT: 'DEFAULT',
    // Default values equal configuration MINIMAL
    create: ({ inactivityTimeout = 3000, checkPeriod = 1000 }) => ({
        inactivityTimeout,
        checkPeriod,
    }),
};
exports.forceScanConfiguration = {
    DISABLED: 'DISABLED',
    MINIMAL: 'MINIMAL',
    // Default values equal configuration MINIMAL
    create: ({ forceScanActivePeriod = 1000, forceScanPassivePeriod = 500 }) => ({
        forceScanActivePeriod,
        forceScanPassivePeriod,
    }),
};
exports.monitoringEnabled = {
    TRUE: true,
    FALSE: false,
};
exports.monitoringSyncInterval = {
    DEFAULT: 10, // 10 seconds
};
