# Database Documentation

## Database
MongoDB (via Mongoose ODM)

---

## Collections Overview

| Collection | Purpose |
|---|---|
| users | User accounts, credentials, roles |
| workflows | Workflow definitions and configuration |
| executions | Records of each workflow run |
| files | Uploaded file metadata |
| logs | Execution, error, and validation logs |
| schedules | Recurring/cron-based execution schedules |
| platforms | Configured automation platform integrations |
| notifications | In-app/email notification records |
| settings | User- and app-level settings |
| roles | Role definitions and permission sets |

---

## Schema Details

### `users`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| name | String | Required |
| email | String | Required, unique |
| password | String | Hashed (bcrypt) |
| role | ObjectId (ref: roles) | Default: "Tester" |
| isActive | Boolean | Default: true |
| createdAt / updatedAt | Date | Timestamps |

### `workflows`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| name | String | Required |
| description | String | |
| platform | ObjectId (ref: platforms) | |
| config | Object | Workflow-specific configuration |
| createdBy | ObjectId (ref: users) | |
| status | String | active / inactive / draft |
| createdAt / updatedAt | Date | Timestamps |

### `executions`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| workflow | ObjectId (ref: workflows) | |
| triggeredBy | ObjectId (ref: users) | |
| status | String | pending / running / success / failed |
| startTime | Date | |
| endTime | Date | |
| duration | Number | In milliseconds |
| result | Object | Execution output/summary |

### `files`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| filename | String | |
| originalName | String | |
| fileType | String | csv / xlsx / json / xml / txt |
| size | Number | In bytes, max 50MB |
| uploadedBy | ObjectId (ref: users) | |
| workflow | ObjectId (ref: workflows) | Optional association |
| createdAt | Date | Timestamp |

### `logs`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| execution | ObjectId (ref: executions) | |
| type | String | execution / error / validation |
| message | String | |
| level | String | info / warning / error |
| timestamp | Date | |

### `schedules`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| workflow | ObjectId (ref: workflows) | |
| frequency | String | daily / weekly / monthly / custom |
| cronExpression | String | Used if frequency = custom |
| isActive | Boolean | Default: true |
| nextRun | Date | Computed |
| createdBy | ObjectId (ref: users) | |

### `platforms`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| name | String | e.g., Selenium, Postman, custom API |
| config | Object | Connection/auth details |
| createdBy | ObjectId (ref: users) | |

### `notifications`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| user | ObjectId (ref: users) | |
| message | String | |
| type | String | info / success / warning / error |
| isRead | Boolean | Default: false |
| createdAt | Date | Timestamp |

### `settings`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| user | ObjectId (ref: users) | Null for app-level settings |
| theme | String | dark / light |
| notificationsEnabled | Boolean | |
| environment | String | development / staging / production |

### `roles`
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | Primary key |
| name | String | Administrator / Project Manager / QA Engineer / Tester |
| permissions | [String] | List of permission keys |

---

## Indexing Notes

- `users.email` — unique index
- `executions.workflow` + `executions.startTime` — compound index for history queries
- `schedules.nextRun` — index for efficient cron scan queries
- `logs.execution` — index for fast log retrieval per execution
