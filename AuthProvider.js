/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { shell } = require('electron');
const { PublicClientApplication } = require("@azure/msal-node");
const { promises: { readFile } } = require("fs");
const path = require("path");

const { msalConfig } = require("./authConfig");

class AuthProvider {
    clientApplication;
    cache;
    account;

    constructor(msalConfig) {
        this.clientApplication = new PublicClientApplication(msalConfig);
        this.cache = this.clientApplication.getTokenCache();
        this.account = null;
    }

    async login(tokenRequest) {
        const authResponse = await this.getToken(tokenRequest);

        if (authResponse !== null) {
            this.account = authResponse.account;
        } else {
            this.account = await this.cache.getAllAccounts()[0];
        }

        return this.account;
    }

    async logout() {
        if (!this.account) return;

        try {
            await this.cache.removeAccount(this.account);
            this.account = null;
            
            await shell.openExternal(`${msalConfig.auth.authority}/oauth2/v2.0/logout`);
        } catch (error) {
            console.log(error);
        }
    }

    async getToken(tokenRequest) {
        let authResponse;
        const account = this.account || (await this.cache.getAllAccounts())[0];

        if (account) {
            tokenRequest.account = account;
            authResponse = await this.getTokenSilent(tokenRequest);
        } else {
            authResponse = await this.getTokenInteractive(tokenRequest);
        }

        return authResponse || null;
    }

    async getTokenSilent(tokenRequest) {
        try {
            return await this.clientApplication.acquireTokenSilent(tokenRequest);
        } catch (error) {
            console.log("Silent token acquisition failed, acquiring token using interactive");
            return await this.getTokenInteractive(tokenRequest);
        }
    }

    async getTokenInteractive(tokenRequest) {
        try {

            const openBrowser = async (url) => {
                // you can use any library to open a browser window, such as `open` or `opn`
                // you can also run custom code here
                shell.openExternal(url);
            };

            const successTemplate = await readFile(path.join(__dirname, "./redirect.html"));

            const authResult = await this.clientApplication.acquireTokenInteractive({
                ...tokenRequest,
                openBrowser,
                successTemplate,
                failureTemplate: '<h1>Oops! Something went wrong</h1> <p>Check the console for more information.</p>',
            });

            return authResult;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthProvider;
