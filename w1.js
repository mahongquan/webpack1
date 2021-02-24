var Watchpack = require("watchpack");

var wp = new Watchpack({
    // options:
    aggregateTimeout: 1000,
    // fire "aggregated" event when after a change for 1000ms no additional change occurred
    // aggregated defaults to undefined, which doesn't fire an "aggregated" event

    poll: true,
    // poll: true - use polling with the default interval
    // poll: 10000 - use polling with an interval of 10s
    // poll defaults to undefined, which prefer native watching methods
    // Note: enable polling when watching on a network path
    // When WATCHPACK_POLLING environment variable is set it will override this option

    followSymlinks: true,
    // true: follows symlinks and watches symlinks and real files
    //   (This makes sense when symlinks has not been resolved yet, comes with a performance hit)
    // false (default): watches only specified item they may be real files or symlinks
    //   (This makes sense when symlinks has already been resolved)

    ignored: "**/.git"
    // ignored: "string" - a glob pattern for files or folders that should not be watched
    // ignored: ["string", "string"] - multiple glob patterns that should be ignored
    // ignored: /regexp/ - a regular expression for files or folders that should not be watched
    // All subdirectories are ignored too
});

// Watchpack.prototype.watch({
//   files: Iterable<string>,
//   directories: Iterable<string>,
//   missing: Iterable<string>,
//   startTime?: number
// })
wp.watch({
    directories: ["./src"],
    startTime: Date.now() - 10000
});
// starts watching these files and directories
// calling this again will override the files and directories
// files: can be files or directories, for files: content and existence changes are tracked
//        for directories: only existence and timestamp changes are tracked
// directories: only directories, directory content (and content of children, ...) and
//              existence changes are tracked.
//              assumed to exist, when directory is not found without further information a remove event is emitted
// missing: can be files or directorees,
//          only existence changes are tracked
//          expected to not exist, no remove event is emitted when not found initially
// files and directories are assumed to exist, when they are not found without further information a remove event is emitted
// missing is assumed to not exist and no remove event is emitted

wp.on("change", function(filePath, mtime, explanation) {
    // filePath: the changed file
    // mtime: last modified time for the changed file
    // explanation: textual information how this change was detected
    console.log(filePath);
    wp.pause();
    wp.watch({
        directories: ["./src"],
    });
});

wp.on("remove", function(filePath, explanation) {
    console.log(filePath);
    // filePath: the removed file or directory
    // explanation: textual information how this change was detected
});

// wp.on("aggregated", function(changes, removals) {
//     // changes: a Set of all changed files
//     // removals: a Set of all removed files
//     // watchpack gives up ownership on these Sets.
// });

// // Watchpack.prototype.pause()
// wp.pause();
// // stops emitting events, but keeps watchers open
// // next "watch" call can reuse the watchers

// // Watchpack.prototype.close()
// wp.close();
// // stops emitting events and closes all watchers

// // Watchpack.prototype.getTimeInfoEntries()
// var fileTimes = wp.getTimeInfoEntries();
// // returns a Map with all known time info objects for files and directories
// // this include info from files not directly watched
// // key: absolute path, value: object with { safeTime, timestamp }
// // safeTime: a point in time at which it is safe to say all changes happened before that
// // timestamp: only for files, the mtime timestamp of the file

// // (deprecated)
// // Watchpack.prototype.getTimes()
// var fileTimes = wp.getTimes();
// // returns an object with all known change times for files
// // this include timestamps from files not directly watched
// // key: absolute path, value: timestamp as number