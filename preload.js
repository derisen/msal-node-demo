// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

const { contextBridge, ipcRenderer } = require('electron');
const { IPC_MESSAGES } = require('./constants');

/**
 * This preload script exposes a "renderer" API to give
 * the Renderer process controlled access to some Node APIs
 * by leveraging IPC channels that have been configured for
 * communication between the Main and Renderer processes.
 */
contextBridge.exposeInMainWorld('renderer', {
    sendLoginMessage: () => {
        ipcRenderer.send(IPC_MESSAGES.LOGIN);
    },
    sendLogoutMessage: () => {
        ipcRenderer.send(IPC_MESSAGES.LOGOUT);
    },
    sendSeeProfileMessage: () => {
        ipcRenderer.send(IPC_MESSAGES.GET_PROFILE);
    },
    setProfileData: (func) => {
        ipcRenderer.on(IPC_MESSAGES.SET_PROFILE, (event, data) => func(event, data));
    },
    showWelcomeMessage: (func) => {
        ipcRenderer.on(IPC_MESSAGES.SHOW_WELCOME_MESSAGE, (event, data) => func(event, data));
    },
});