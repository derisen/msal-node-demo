/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require("path");
const { app, ipcMain, BrowserWindow } = require("electron");

const AuthProvider = require("./AuthProvider");
const getGraphClient = require("./graph");
const { msalConfig, protectedResources } = require("./authConfig");

const authProvider = new AuthProvider(msalConfig);
let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
    });

    mainWindow.on('show', () => {
        setTimeout(() => {
            mainWindow.focus();
        }, 200); // in case of any race conditions
    });
};

app.on("ready", () => {
    createWindow();
    mainWindow.loadFile(path.join(__dirname, "./index.html")).then(() => mainWindow.show());
});


app.on("window-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

/* EVENT HANDLERS */

ipcMain.on('LOGIN', async () => {
    await authProvider.login();

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"));
    mainWindow.show();

    mainWindow.webContents.send('SHOW_WELCOME_MESSAGE', authProvider.account);
});

ipcMain.on('LOGOUT', async () => {
    await authProvider.logout();

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"))
    mainWindow.show();
});

ipcMain.on('GET_PROFILE', async () => {
    const tokenResponse = await authProvider.getToken({
        scopes: protectedResources.graphMe.scopes
    });

    try {
        const graphResponse = await getGraphClient(tokenResponse.accessToken).api('/me').get();

        // update ui
        await mainWindow.loadFile(path.join(__dirname, "./index.html"));
        mainWindow.show();

        mainWindow.webContents.send('SHOW_WELCOME_MESSAGE', authProvider.account);
        mainWindow.webContents.send('SET_PROFILE', graphResponse);
    } catch (error) {
        console.log(error);
    }
});
