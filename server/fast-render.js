FastRender.onAllRoutes(function () {
    this.subscribe('cinemas');
    this.subscribe('movies');
    this.subscribe('userData');
    this.subscribe('movie-synonyms');
});