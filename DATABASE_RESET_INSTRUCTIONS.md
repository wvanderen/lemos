# Database Reset Instructions

The database needs to be upgraded from version 2 to version 3 to add the `unified_logs` and `context_snapshots` tables.

## Option 1: Use DevTools Console (Recommended)

1. Open the browser DevTools (F12)
2. Go to the **Console** tab
3. Paste and run this command:

```javascript
await (await import('@lemos/platform-storage-local')).IndexedDBStorage.resetDatabase()
```

4. Refresh the page
5. The database will be recreated with version 3 schema

## Option 2: Manual Reset via Application Tab

1. Open DevTools (F12)
2. Go to **Application** tab
3. In the left sidebar, expand **Storage > IndexedDB**
4. Right-click on **lemos-db**
5. Select **Delete database**
6. Refresh the page

## Option 3: Close All Tabs

If the above doesn't work:
1. Close ALL tabs/windows with the app open
2. Open a fresh tab with the app
3. The migration should run automatically

## Verify Success

After the reset, you should see in the Console:
```
Creating object store: unified_logs
Created indexes for unified_logs
Creating object store: context_snapshots
Created indexes for context_snapshots
Database upgrade complete
```

Then the Logger should work correctly!
