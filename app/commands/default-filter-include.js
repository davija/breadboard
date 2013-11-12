function filter (context, callback) {

    /**
     * This is the default filter function, and always includes the link in question.
     * In other words, if no filter criteria is specified, a given link will exist on the response.
     */

    callback(context.link);

};