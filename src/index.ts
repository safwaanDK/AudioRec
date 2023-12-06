import {
    $query,
    $update,
    blob,
    ic,
    Opt,
    Principal,
    Record,
    Result,
    StableBTreeMap,
    Variant,
    Vec,
    nat64,
    match
  } from 'azle';
  import { v4 as uuidv4 } from "uuid";
  
  // Define the User structure
  type User = Record<{
    id: string;
    createdAt: nat64;
    recordingIds: Vec<string>;
    username: string;
  }>;
  
  // Define the Recording structure
  type Recording = Record<{
    id: string;
    audio: blob;
    createdAt: nat64;
    name: string;
    userId: string;
  }>;
  
  // Define the AudioRecorderError structure
  type AudioRecorderError = Variant<{
    RecordingDoesNotExist: string;
    UserDoesNotExist: string;
  }>;
  
  // Initialize the users and recordings storage
  const users = new StableBTreeMap<string, User>(0, 44, 1024);
  const recordings = new StableBTreeMap<string, Recording>(1, 44, 1024);
  
  
  
  $update
  export function createUser(username: string): Result<User, string> {
    try {
      // Payload validation
      if (!username) {
        throw new Error("Invalid payload for creating a user.");
      }
  
      const id = uuidv4();
      const user: User = {
        id,
        createdAt: ic.time(),
        recordingIds: [],
        username,
      };
  
      users.insert(user.id, user);
  
      return Result.Ok(user);
    } catch (error) {
      // Error handling
      return Result.Err(`Failed to create user: ${error}`);
    }
  }
  
  $query
  export function readUsers(): Result<Vec<User>, string> {
    try {
      // Return user values
      return Result.Ok<Vec<User>, string>(users.values());
    } catch (error: any) {
      // Error handling
      return Result.Err<Vec<User>, string>('Failed to retrieve users');
    }
  }
  
  $query
  export function readUserById(id: string): Result<User, string> {
    // Payload validation
    if (!id) {
      throw new Error("Invalid payload for creating a user.");
    }
  
    return match(users.get(id), {
      Some: (user) => Result.Ok<User, string>(user),
      None: () => Result.Err<User, string>(`User with ID=${id} not found.`),
    });
  }
  
  $update
  export function deleteUser(id: string): Result<User, AudioRecorderError> {
  
    // Payload validation
    if (!id) {
      throw new Error("Invalid Id Parameter");
    }
  
    return match(users.get(id), {
      Some: (user) => {
        // Delete associated recordings
        user.recordingIds.forEach((recordingId) => {
          recordings.remove(recordingId);
        });
  
        // Remove the user
        users.remove(user.id);
  
        return Result.Ok<User, AudioRecorderError>(user);
      },
      None: () => Result.Err<User, AudioRecorderError>({ UserDoesNotExist: id }),
    });
  }
  
  $update
  export function createRecording(
    audio: blob,
    name: string,
    userId: string
  ): Result<Recording, AudioRecorderError> {
    // Payload validation
    if (!userId) {
      throw new Error("Invalid UserId.");
    }
  
    // Payload validation
    if (!audio || !name) {
      throw new Error("Invalid payload for creating a recording.");
    }
  
    return match(users.get(userId), {
      Some: (user) => {
        
        const id = uuidv4();
        const recording: Recording = {
          id,
          audio,
          createdAt: ic.time(),
          name,
          userId,
        };
  
        // Insert recording
        recordings.insert(recording.id, recording);
  
        // Update user's recordingIds
        const updatedUser: User = {
          ...user,
          recordingIds: [...user.recordingIds, recording.id],
        };
  
        users.insert(updatedUser.id, updatedUser);
  
        return Result.Ok<Recording, AudioRecorderError>(recording);
      },
      None: () => Result.Err<Recording, AudioRecorderError>({ UserDoesNotExist: userId }),
    });
  }
  
  $query
  export function readRecordings(): Result<Vec<Recording>, string> {
    try {
      // Return recording values
      return Result.Ok(recordings.values());
    } catch (error: any) {
      // Error handling
      return Result.Err(`Failed to retrieve recordings: ${error}`);
    }
  }
  
  $query
  export function readRecordingById(id: string): Result<Recording, string> {
    // Payload validation
    if (!id) {
      throw new Error("Invalid Id Parameter.");
    }
  
    return match(recordings.get(id), {
      Some: (recording) => Result.Ok<Recording, string>(recording),
      None: () => Result.Err<Recording, string>(`Recording with ID=${id} not found.`),
    });
  }
  
  $update
  export function deleteRecording(id: string): Result<Recording, AudioRecorderError> {
    // Payload validation
    if (!id) {
      throw new Error("Invalid Id Parameter");
    }
  
    const recordingOpt = recordings.get(id);
  
    return match(recordingOpt, {
      Some: (recording) => {
        const userOpt = users.get(recording.userId);
  
        return match(userOpt, {
          Some: (user) => {
            // Update user's recordingIds
            const updatedUser: User = {
              ...user,
              recordingIds: user.recordingIds.filter(
                (recordingId) => recordingId !== recording.id
              ),
            };
  
            users.insert(updatedUser.id, updatedUser);
  
            // Remove recording
            recordings.remove(id);
  
            return Result.Ok<Recording, AudioRecorderError>(recording);
          },
          None: () => Result.Err<Recording, AudioRecorderError>({
            UserDoesNotExist: recording.userId,
          }),
        });
      },
      None: () => Result.Err<Recording, AudioRecorderError>({
        RecordingDoesNotExist: id,
      }),
    });
  }
  
  globalThis.crypto = {
    //@ts-ignore
    getRandomValues: () => {
      let array = new Uint8Array(32);
  
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
  
      return array;
    },
  };
  