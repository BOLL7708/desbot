export class BaseEnum {
    /**
     * Get the name of the class appended with the Enum flag.
     * If this ID is referenced when instancing a class, it will be a dropdown listing the properties as alternatives.
     */
    static ref() {
        return this.name+'|enum'
    }
}