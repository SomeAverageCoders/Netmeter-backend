// lib/unifiService.ts

const Unifi = require('node-unifi');

export async function getClientData() {
  try {
    const controller = new Unifi.Controller({
      host: process.env.UNIFI_HOST!,
      port: 8443,
      username: process.env.UNIFI_USERNAME!,
      password: process.env.UNIFI_PASSWORD!,
      sslverify: false
    });

    await controller.login();

    const sites = await controller.getSites();
    const site = sites[0]; // Default to first site; customize as needed

    const clients = await controller.getClientDevices(site.name);
    return clients;
  } catch (error: any) {
    console.error("⚠️ UniFi API Error:", error.message);
    throw error;
  }
}
