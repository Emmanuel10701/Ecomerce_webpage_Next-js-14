import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const settingsFilePath = path.join(process.cwd(), 'data', 'settings.json');

// Read settings from the file
async function getSettings() {
  const data = fs.readFileSync(settingsFilePath, 'utf-8');
  return JSON.parse(data);
}

// Write settings to the file
async function saveSettings(settings: any) {
  fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
}

// API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await getSettings();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving settings' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const settings = await getSettings(); // Retrieve current settings
      const updatedSettings = { ...settings, ...req.body }; // Merge with new settings
      await saveSettings(updatedSettings); // Save updated settings
      res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating settings' });
    }
  } else if (req.method === 'DELETE') {
    try {
      fs.unlinkSync(settingsFilePath); // Delete the settings file
      res.status(200).json({ message: 'Settings deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
