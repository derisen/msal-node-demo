/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { shell } = require('electron');
const { PublicClientApplication, InteractionRequiredAuthError, LogLevel } = require("@azure/msal-node");
const { promises: { readFile } } = require("fs");
const path = require("path");

class AuthProvider {
    clientApplication;
    msalConfig;
    cache;
    account;

    constructor() {
        this.msalConfig = {
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

        this.clientApplication = new PublicClientApplication(this.msalConfig);
        this.cache = this.clientApplication.getTokenCache();
        this.account = null;
    }

    async login(loginRequest) {
        try {
            const openBrowser = async (url) => {
                // you can also run custom code here
                shell.openExternal(url);
            };

            const successTemplate = await readFile(path.join(__dirname, "./redirect.html"));

            const authResponse = await this.clientApplication.acquireTokenInteractive({
                ...loginRequest,
                openBrowser,
                successTemplate,
                failureTemplate: '<h1>Oops! Something went wrong</h1> <p>Check the console for more information.</p>',
            });

            console.log(authResponse);

            this.account = authResponse.account;
        } catch (error) {
            console.log(error);
        }
    }

    async logout() {
        if (!this.account) return;

        try {
            await this.cache.removeAccount(this.account);
            this.account = null;

            await shell.openExternal(`${this.msalConfig.auth.authority}/oauth2/v2.0/logout`);
        } catch (error) {
            console.log(error);
        }
    }

    async getToken(tokenRequest) {
        try {
            const authResponse = await this.clientApplication.acquireTokenSilent(tokenRequest);
            return authResponse;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                const openBrowser = async (url) => {
                    // you can also run custom code here
                    shell.openExternal(url);
                };

                const successTemplate = await readFile(path.join(__dirname, "./redirect.html"));

                const authResponse = await this.clientApplication.acquireTokenInteractive({
                    ...tokenRequest,
                    openBrowser,
                    successTemplate,
                    failureTemplate: '<h1>Oops! Something went wrong</h1> <p>Check the console for more information.</p>',
                });

                return authResponse;
            }

            console.log(error);
        }
    }
}

module.exports = AuthProvider;
