# Library JSON format (schema version 1)

Each file contains exactly one library:

```json
{
  "schemaVersion": 1,
  "library": {
    "id": "weekend-ideas",
    "name": "Weekend ideas",
    "description": "Activities for a free weekend.",
    "type": "wheel",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "updatedAt": "2026-01-01T12:00:00.000Z",
    "entries": [
      { "id": "weekend-001", "text": "Visit a new neighbourhood" }
    ]
  }
}
```

Supported `type` values are `wheel`, `what`, `where`, `when`, and `caveat`.

Names are required and limited to 80 characters. Descriptions and entry text are limited to 500 characters; entry text cannot be blank. IDs must be non-empty and entry IDs must be unique within the file. Timestamps must be ISO strings. Files are limited to 1 MB and 2,000 entries.

Imported IDs are never trusted as local database IDs. The app validates the complete file, shows a preview, regenerates all IDs, and saves in one transaction only after confirmation.
