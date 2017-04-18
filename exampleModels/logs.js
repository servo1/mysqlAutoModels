{
  "def": {
    "fields": {
      "id": {
        "type": "string",
        "required": 0
      },
      "receivedAt": {
        "type": "date",
        "required": 1
      },
      "found": {
        "type": "string",
        "required": 1
      },
      "dataStart": {
        "type": "date",
        "required": 1
      },
      "dataDone": {
        "type": "date",
        "required": 1
      },
      "pathName": {
        "type": "string",
        "required": 1
      },
      "dataPath": {
        "type": "string",
        "required": 1
      },
      "returnedAt": {
        "type": "date",
        "required": 1
      },
      "sessionId": {
        "type": "string",
        "required": 1
      },
      "userId": {
        "type": "number",
        "required": 1
      },
      "updatedAt": {
        "type": "date",
        "required": 1
      },
      "ip": {
        "type": "string",
        "required": 1
      }
    },
    "name": "logs",
    "service": "mysql",
    "type": "table"
  }
}
