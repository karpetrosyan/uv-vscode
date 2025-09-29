As [VS Code states](https://code.visualstudio.com/docs/python/environments): an "environment" in Python is the context in which a Python program runs, consisting of an interpreter and any number of installed packages.

When working on a project in VS Code, you need to configure the virtual environment to point to the interpreter that has access to the dependencies your project needs, so the IDE can provide suggestions and autocompletion.

When using the extension, it will automatically switch the environment to a script's environment when you open a file that contains inline metadata. This ensures that you get autocompletion and all the necessary features when working with a Python script.

![run script](/change-environments.gif){.light-only}
![run script](/change-environments-dark.gif){.dark-only}

The extension will remember the last environment you used for a script, and when switching to a non-script file, it will switch back to that environment so you can continue working on your main project.

This simplifies working with script files alongside your main project: just open the script file, work with it, and then close it to get your main project environment back.
