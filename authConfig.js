/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { LogLevel } = require("@azure/msal-node");

const msalConfig = {
    auth: {
        clientId: "ENTER_CLIENT_ID",
        authority: `https://login.microsoftonline.com/ENTER_TENANT_ID`,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: LogLevel.Verbose,
        },
    },
};

const protectedResources = {
    graphMe: {
        endpoint: `https://graph.microsoft.com/v1.0/me`,
        scopes: ["User.Read"],
    },
};


module.exports = {
    msalConfig,
    protectedResources
};
