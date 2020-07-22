const App = function() {
  const json = {
    series: [
      { category: "fruit", label: "apple", value: 241 },
      { category: "fruit", label: "pear", value: 101 },
      { category: "fruit", label: "cantaloupe", value: 5 },
      { category: "fruit", label: "watermelon", value: 5 },
      { category: "vegetable", label: "tomato", value: 88 },
      { category: "vegetable", label: "carrot", value: 49 },
      { category: "vegetable", label: "melon", value: 113 },
      { category: "meat", label: "beef", value: 97 },
      { category: "meat", label: "lamb", value: 142 },
      { category: "meat", label: "pork", value: 6 }
     ]
  };

  function start () {
    page();
    menu();

    const tree = new chart.Treechart({
      container: document.getElementById("chart"),
      data: json,
      margin: { bottom: 10, left: 10, right: 10, top: 10 }
    });

    tree.draw();
  }

  function menu() {
    const menu = document.querySelector(".menu");
    const menuButton = document.querySelector(".menu-button");

    if (menu && menuButton) {
      menuButton.addEventListener("click", function(e) {
        e.stopImmediatePropagation();
        menu.classList.toggle("ready");
      });
      menu.addEventListener("click", function(e) { e.stopImmediatePropagation(); });
    }
    window.addEventListener("hide-menu", function() { menu.classList.add("ready"); });
  }

  function page() {
    const chart = document.getElementById("chart");
    
    chart.addEventListener("click", function() {
      window.dispatchEvent(new CustomEvent("hide-menu"));
    });

    window.addEventListener("tree-selected", function(e) {
      console.log(e.detail.id + " was selected.");
    });
  }

  App.start = start;

  return App;
};
