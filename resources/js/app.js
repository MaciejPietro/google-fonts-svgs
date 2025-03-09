"use strict";

import Alpine from "alpinejs";
import "./alpine/App.js";

(function () {
  const app = {};

  app.init = () => {
    Alpine.start();
  };

  app.init();
})();
