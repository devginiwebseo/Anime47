async function check() {
    try {
        const res = await fetch("https://anime.datatruyen.online/api/public/movies?limit=1");
        const data = await res.json();
        const movie = data.data?.[0];
        if (movie) {
            console.log("FULL MOVIE OBJECT:");
            console.log(JSON.stringify(movie, null, 2));
        } else {
            console.log("No movie found");
        }
    } catch (e) {
        console.error(e);
    }
}

check();
