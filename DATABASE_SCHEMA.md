# Database Schema Documentation

## Overview

This project uses PostgreSQL with Prisma ORM to store MakeCode projects.

---

## Prisma Schema

```prisma
model Project {
  id              String   @id @default(cuid())
  name            String   @default("Untitled Project")
  makecodeProject Json?    // Stores the MakeCode project data as JSON
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Database Table: `Project`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `String` | Primary key, auto-generated CUID (e.g., `cm5abc123def456`) |
| `name` | `String` | Project name, defaults to "Untitled Project" |
| `makecodeProject` | `Json` | Full MakeCode project data (nullable) |
| `createdAt` | `DateTime` | Timestamp when project was created |
| `updatedAt` | `DateTime` | Timestamp of last update (auto-updated) |

---

## Example Database Entry

```json
{
  "id": "cm5abc123def456",
  "name": "My First Project",
  "makecodeProject": {
    "header": {
      "id": "cm5abc123def456",
      "name": "Untitled",
      "target": "microbit",
      "targetVersion": "6.0.0",
      "meta": {}
    },
    "text": {
      "main.ts": "basic.showString(\"Hello!\")\nbasic.forever(function () {\n\n})\n",
      "main.blocks": "<xml xmlns=\"https://developers.google.com/blockly/xml\">\n  <block type=\"pxt-on-start\" id=\"on-start-block\" x=\"0\" y=\"0\">\n    <statement name=\"HANDLER\">\n      <block type=\"basic_showstring\">\n        <value name=\"text\">\n          <shadow type=\"text\"><field name=\"TEXT\">Hello!</field></shadow>\n        </value>\n      </block>\n    </statement>\n  </block>\n  <block type=\"device_forever\" id=\"forever-block\" x=\"0\" y=\"200\"></block>\n</xml>",
      "pxt.json": "{\"name\":\"Untitled\",\"description\":\"\",\"dependencies\":{\"core\":\"*\",\"radio\":\"*\",\"microphone\":\"*\"},\"files\":[\"main.blocks\",\"main.ts\"],\"preferredEditor\":\"blocksprj\"}"
    }
  },
  "createdAt": "2026-01-28T10:30:00.000Z",
  "updatedAt": "2026-01-28T10:35:00.000Z"
}
```

---

## MakeCode Project Structure

The `makecodeProject` JSON field contains:

### `header` Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Project ID (matches database ID) |
| `name` | `string` | Project name in MakeCode |
| `target` | `string` | Target platform: `"microbit"` |
| `targetVersion` | `string` | MakeCode version (e.g., `"6.0.0"`) |
| `meta` | `object` | Additional metadata |

### `text` Object
| Field | Type | Description |
|-------|------|-------------|
| `main.ts` | `string` | TypeScript source code |
| `main.blocks` | `string` | Blockly XML representation of blocks |
| `main.py` | `string` | Python source (optional) |
| `pxt.json` | `string` | Package configuration (JSON string) |

---

## API Endpoints

### `GET /api/projects`
Returns all projects sorted by `updatedAt` (newest first).

### `POST /api/projects`
Creates a new project.
```json
{
  "name": "My Project",
  "makecodeProject": { ... }  // Optional
}
```

### `GET /api/projects/{id}`
Returns a single project by ID.

### `PUT /api/projects/{id}`
Creates or updates a project (upsert).
```json
{
  "name": "Updated Name",
  "makecodeProject": { ... }
}
```

### `DELETE /api/projects/{id}`
Deletes a project.

---

## Query Examples

### View all projects
```sql
SELECT * FROM "Project" ORDER BY "updatedAt" DESC;
```

### View specific project
```sql
SELECT * FROM "Project" WHERE id = 'cm5abc123def456';
```

### View project with formatted JSON
```sql
SELECT id, name, makecodeProject::text, "createdAt", "updatedAt"
FROM "Project"
WHERE id = 'cm5abc123def456';
```

### Search by project name
```sql
SELECT * FROM "Project" WHERE name ILIKE '%hello%';
```

---

## Data Flow

```
User creates blocks in MakeCode
         ↓
MakeCode sends `workspacesave` message with project data
         ↓
MakeCodeEditor receives message via postMessage
         ↓
Frontend calls PUT /api/projects/{id}
         ↓
Prisma upserts to PostgreSQL
         ↓
Project saved with updated `makecodeProject` JSON
```
