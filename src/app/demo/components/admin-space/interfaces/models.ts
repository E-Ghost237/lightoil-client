export interface NewIncomingData {
    "id": number,
    "sensor_ref": string,
    "tank_volume": number,
    "product_name": string,
    "product_volume": number,
    "product_level": number,
    "is_depotage": number,
    "updated_at": string,
}

export interface ServiceStation {
    "id": number,
    "name": string,
    "latitude": string,
    "longitude": string,
    "status": string,
    "address": string,
    "town_id": number,
    "city": string,
    "company_id": number,
    "gmt": string
}

export interface Product {
    "id": number,
    "name": string,
    "code": string,
    "price": number
}
