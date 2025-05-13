class Menu {
  constructor(buttons) {
    this.buttons = buttons;
  }

  showButtons() {
    this.buttons.forEach(function (button) {
      button.show();
    });
  }

  logic() {
    this.showButtons();
  }
}
