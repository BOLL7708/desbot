# Shared
This code is shared between the Server and Client, meaning it runs both in Node and browsers.
## Categories
* Bot `Classes that previously ran in the browser.`
* Classes `Instanced classes, standard objects basically.`
* Constants `Static value references.`
* Helpers `Static methods that also store internal static values.`
* Interfaces `General interfaces used across the codebase. Usually interfaces should be appended to classes where they originated.`
* Objects `Classes that used to stored in the database and and to run the bot.`
  * Data `Root objects that are both data classes that are JSON-encoded into the DB and contain code that can be run by the bot.`
  * Options `Classes that emulate Enums but are classes that can be stored in the database.`
* Singletons `Single instances that are stored statically.`
* Utils `Fully static method collections without any type of value storage.`