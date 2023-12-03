# Audio Recording Backend Application

This repository contains a basic backend application for an audio recording service, designed for the Internet Computer (IC) platform. The application is structured around two primary entities:

- **User**: Represents the users of the service.
- **Recording**: Represents the audio recordings created by the users.

Both entities are defined as Candid records, each with its own set of attributes.

## Features

- **User Management**: Functions to create, read, and delete user records.
- **Recording Management**: Functions to create, read, and delete audio recordings.
- **Stable Storage**: Both users and recordings are stored in stable B-tree maps, ensuring data persistence.
- **Error Handling**: The application includes error handling for scenarios such as non-existent users or recordings.
- **Unique Identifier Generation**: A custom function `generateId` is used to create unique identifiers for users and recordings.

## Entity Details

### User
- `id`: Unique identifier for the user (Principal).
- `createdAt`: Timestamp of user creation (nat64).
- `recordingIds`: List of recording identifiers associated with the user (Vec(Principal)).
- `username`: Username of the user (text).

### Recording
- `id`: Unique identifier for the recording (Principal).
- `audio`: Audio data blob.
- `createdAt`: Timestamp of recording creation (nat64).
- `name`: Name of the recording (text).
- `userId`: Identifier of the user who created the recording (Principal).

## Functions

### User Functions
- `createUser`: Create a new user.
- `readUsers`: Retrieve all users.
- `readUserById`: Retrieve a user by their ID.
- `deleteUser`: Delete a user.

### Recording Functions
- `createRecording`: Create a new recording.
- `readRecordings`: Retrieve all recordings.
- `readRecordingById`: Retrieve a recording by its ID.
- `deleteRecording`: Delete a recording.

## Error Types

- `RecordingDoesNotExist`: Error for non-existent recordings.
- `UserDoesNotExist`: Error for non-existent users.
