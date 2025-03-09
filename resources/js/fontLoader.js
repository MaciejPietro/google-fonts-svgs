export default class FontLoader {
  API_KEY = "AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc";

  async getGoogleFonts() {
    return await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${this.API_KEY}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.fontList = data;

        return data;
      })
      .catch((error) => {
        console.error("Error fetching Google Fonts:", error);
      });
  }
}
