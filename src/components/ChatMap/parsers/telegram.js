
/**
 * Contains a main parser function and supporting fuctions
 * for creating a map from a Telegram conversation log.
 *
 * The Map is stored in memory as a GeoJSON and a list
 * of media files
 */

import { getClosestMessage } from "../chatmap";
import { searchLocation } from "./whatsapp";

function stripPath(filename) {
    return filename.substring(filename.lastIndexOf("/") + 1, filename.length);
}

// Parse time, username and message
const parseMessage = (line) => {
    let text = "";
    let msgObject = {
        time: parseTimeString(line.date),
        username: line.from,
    };
    if (Array.isArray(line.text)) {
        line.text.forEach(item => {
            if (item.type === "link") {
                text = item.text;
            }
        });
    } else if (line.text !== "") {
        text = line.text;
    }
    msgObject.message = text;

    if (line.location_information) {
        msgObject.location = [line.location_information.latitude, line.location_information.longitude]; 
    }
    if (line.photo) {
        msgObject.file = stripPath(line.photo);
    }
    if (line.file && line.mime_type === "video/mp4") {
        msgObject.file = stripPath(line.file);
    }
    return msgObject;
}

// Parse time strings
const parseTimeString = (dateStr) => {
    return new Date(dateStr);
}

// Parse messages from lines and create an index
const parseAndIndex = (lines) => {
    let index = 0;
    const result = {};
    lines.forEach((line) => {
        const msg = parseMessage(line);
        if (msg) {
            result[index] = msg;
            result[index].id = index;
            index++;
        }
    })
    return result;
}

export default function telegramParser({ text }) {
    if (!text) return;
    const json = JSON.parse(text);
    const geoJSON = {
        type: "FeatureCollection",
        features: []
    };

    // Creates an indexed dictionary for messages
    const messages = parseAndIndex(json.messages);
    const msgObjects = Object.values(messages);

    msgObjects.forEach((msgObject, index) => {
        if (msgObject.location) {
            let featureObject = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "Point",
                    coordinates: [
                        msgObject.location[1],
                        msgObject.location[0]
                    ]
                }
            }
            const message = getClosestMessage(messages, index, searchLocation);
            // Add the GeoJSON feature
            if (message) {
                featureObject.properties = {...message};
                featureObject.properties.related = message.id;
                messages[message.id].mapped = true;
            } else {
                // No related message
                featureObject.properties = {
                    username: msgObject.username,
                    time: msgObject.time
                }
            }
            featureObject.properties.id = index;
            geoJSON.features.push(featureObject);
            messages[index].mapped = true;
        }
    });

    return {geoJSON, messages};
}
