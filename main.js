/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require("path");
const { app, ipcMain, BrowserWindow } = require("electron");

const { IPC_MESSAGES } = require("./constants");

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

ipcMain.on(IPC_MESSAGES.LOGIN, async () => {
    // add login logic here

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"));
    mainWindow.show();
    
    mainWindow.webContents.send(IPC_MESSAGES.SHOW_WELCOME_MESSAGE, null);
});

ipcMain.on(IPC_MESSAGES.LOGOUT, async () => {
    // add logout logic here

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"))
    mainWindow.show();
});

ipcMain.on(IPC_MESSAGES.GET_PROFILE, async () => {
    // add get token logic here

    // add call graph logic here

    // update ui
    mainWindow.loadFile(path.join(__dirname, "./index.html"));
    mainWindow.show();

    mainWindow.webContents.send(IPC_MESSAGES.SHOW_WELCOME_MESSAGE, null);
    mainWindow.webContents.send(IPC_MESSAGES.SET_PROFILE, null);
});
