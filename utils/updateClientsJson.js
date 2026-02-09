import fs from "fs";
import path from "path";
import Client from "../models/Client.js";

export const updateClientsJson = async () => {
    const clients = await Client.find({}, {
        _id: 0,
        name: 1,
        imageUrl: 1,
        link: 1
    }).lean();

    const filePath = path.join(process.cwd(), "public", "clients.json");

    fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
};
