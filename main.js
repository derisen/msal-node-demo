/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require("path");
const { app, ipcMain, BrowserWindow } = require("electron");

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
    });

    mainWindow.loadFile(path.join(__dirname, "./index.html"))
};

app.on("ready", () => {
    createWindow();
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
    // add login logic here

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"));
    
    mainWindow.webContents.send('SHOW_WELCOME_MESSAGE', null);
});

ipcMain.on('LOGOUT', async () => {
    // add logout logic here

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"))
});

ipcMain.on('GET_PROFILE', async () => {
    // add get token logic here

    // add call graph logic here

    // update ui
    await mainWindow.loadFile(path.join(__dirname, "./index.html"));

    mainWindow.webContents.send('SHOW_WELCOME_MESSAGE', null);
    mainWindow.webContents.send('SET_PROFILE', null);
});
