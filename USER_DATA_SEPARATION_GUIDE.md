# User Data Separation Implementation Guide

## Overview
This document explains the user data separation implementation that ensures each user's data is completely isolated and private.

## What Changed

### 1. New User Storage Utility (`utils/userStorage.js`)
A new centralized storage utility that automatically prefixes all storage keys with the current user's ID:
- **`setUserData(key, value)`** - Store data for the current user
- **`getUserData(key)`** - Retrieve data for the current user
- **`removeUserData(key)`** - Remove specific user data
- **`clearAllUserData()`** - Clear all data for the current user
- **`setCurrentUserId(userId)`** - Set the active user ID
- **`clearCurrentUserId()`** - Clear the user ID on logout

### 2. Updated Files

#### **context/AuthContext.js**
- Sets the current user ID when signing in
- Clears the user ID when signing out
- Uses user-specific storage for multistep completion status
- User info itself is stored globally (to know who's logged in), but all user data is stored with user-specific keys

#### **context/TaskContext.js**
- All tasks are now stored with user-specific keys
- Each user sees only their own tasks

#### **utils/userPreferences.js**
- Semesters, class schedules, and free time are all user-specific
- MultiStep validation is tracked per user
- Each user maintains their own semester selections and preferences

#### **utils/conversationHistory.js**
- AI chat conversations are now user-specific
- Each user has their own conversation history

#### **screens/MultiStep.js**
- Semester setup data is stored per user
- Class schedules and free time are isolated by user

#### **App.js**
- Navigation state is stored per user
- Each user returns to where they left off in the app

## How It Works

### Storage Key Format
Before: `scheduleTasks` (global for all users)
After: `user_john@example.com_scheduleTasks` (specific to john@example.com)

### User Identification
The system uses the user's email or ID from Google Sign-In to create a unique identifier:
```javascript
const userId = userData.user?.id || userData.id || userData.email;
```

### Data Flow

1. **Sign In:**
   - User signs in via Google
   - System extracts user ID from their profile
   - `setCurrentUserId()` is called with their ID
   - All subsequent storage operations use this user's prefix

2. **Data Operations:**
   - When saving: `setUserData('tasks', tasks)` → stores as `user_123_tasks`
   - When loading: `getUserData('tasks')` → retrieves `user_123_tasks`

3. **Sign Out:**
   - `clearCurrentUserId()` is called
   - User's data remains in storage but is no longer accessible
   - Next user sees only their own data

## Data Isolation Benefits

✅ **Complete Privacy:** Each user's data is stored with a unique prefix
✅ **No Cross-Contamination:** Switching accounts shows different data
✅ **Persistent Storage:** User data persists across sessions
✅ **Clean Separation:** Logging out doesn't delete data, just clears the active user context

## Storage Keys by Feature

### User-Specific Keys (prefixed with `user_{userId}_`)
- `scheduleTasks` - Calendar tasks and events
- `semesters` - Semester definitions
- `selected_semester` - Currently selected semester
- `semester_{id}_classes` - Class schedule for a specific semester
- `semester_{id}_freetime` - Free time slots for a specific semester
- `multistep_complete` - Whether user completed initial setup
- `multistep_validation` - Step validation status
- `conversationHistory` - AI chat history
- `navigation_state` - Navigation state in the app
- `userSemester` - Legacy semester preferences
- `userClasses` - Legacy class schedule
- `userFreeTime` - Legacy free time

### Global Keys (not user-specific)
- `@TomoTime:user` - Currently logged-in user info

## Migration Notes

### Existing Users
Users who have data stored with old keys will need to:
1. Sign in again
2. Re-enter their data in MultiStep setup

OR implement a migration function (optional):
```javascript
// This could be added to AuthContext.js after sign-in
const migrateOldData = async (userId) => {
  // Read old global data
  const oldTasks = await AsyncStorage.getItem('scheduleTasks');
  
  // If exists, migrate to user-specific storage
  if (oldTasks) {
    await setUserData('scheduleTasks', JSON.parse(oldTasks));
    await AsyncStorage.removeItem('scheduleTasks');
  }
  
  // Repeat for other keys...
};
```

### Testing the Implementation

1. **Test User Separation:**
   - Sign in as User A
   - Add some tasks and complete MultiStep
   - Sign out
   - Sign in as User B
   - Verify User B sees no data from User A
   - Add different tasks for User B
   - Sign out and sign in as User A again
   - Verify User A's data is still there

2. **Test Data Persistence:**
   - Sign in and add data
   - Close and reopen the app
   - Verify data persists

3. **Test Clean Logout:**
   - Sign in and add data
   - Sign out
   - Sign in as a different user
   - Verify previous user's data is not visible

## Troubleshooting

### Issue: User sees no data after updating
**Solution:** This is expected for existing users. They need to re-enter their data, or you need to implement a migration function.

### Issue: Data appears to be shared between users
**Solution:** Ensure `setCurrentUserId()` is being called in `AuthContext.signIn()`. Check the console logs to verify the user ID is being set correctly.

### Issue: Data doesn't persist after logout/login
**Solution:** Verify that `clearCurrentUserId()` is not being called until actual logout. The user ID should persist across app restarts if the user stays logged in.

## Code Examples

### Storing User Data
```javascript
import { setUserData } from '../utils/userStorage';

// Store tasks for current user
await setUserData('scheduleTasks', tasks);
```

### Retrieving User Data
```javascript
import { getUserData } from '../utils/userStorage';

// Get tasks for current user
const tasks = await getUserData('scheduleTasks');
```

### Checking Current User
```javascript
import { getCurrentUserId } from '../utils/userStorage';

const userId = getCurrentUserId();
if (userId) {
  console.log('Current user:', userId);
}
```

## Security Considerations

- User IDs are visible in AsyncStorage keys (e.g., `user_john@example.com_tasks`)
- Data is stored unencrypted in AsyncStorage
- For sensitive data, consider additional encryption
- AsyncStorage on React Native is already sandboxed per app

## Future Enhancements

Potential improvements to consider:
1. **Data Encryption:** Encrypt sensitive user data
2. **Cloud Sync:** Sync user data to cloud storage
3. **Data Migration Tool:** Automatically migrate old data format
4. **Offline Detection:** Handle offline scenarios gracefully
5. **Data Export:** Allow users to export their data
6. **Account Deletion:** Provide option to delete all user data

## Summary

The user data separation implementation ensures:
- ✅ Each user has completely isolated data storage
- ✅ No data leaks between user accounts
- ✅ Clean logout without data loss
- ✅ Persistent user-specific settings
- ✅ Scalable architecture for multiple users
