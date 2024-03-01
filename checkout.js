// Opções de Presente
const createGiftOptions = () => {
  const body = document.querySelector("body");
  const cartSummaryHolder = document.querySelector(".cart-template > .summary-template-holder");
  const giftTriggerHolder = document.querySelector("#gift-trigger-holder");
  const giftSelectedHolder = document.querySelector("#gift-selected-holder");
  const overlayTemplateHolder = document.querySelector("#gift-template-overlay");

  // Alternate between trigger & selected layouts
  const handleLayoutAlternation = (elm) => {
    const cartNoteValue = $("#cart-note").val();
    const _triggerHolder = elm.querySelector("#gift-trigger-holder");
    const _selectedHolder = elm.querySelector("#gift-selected-holder");

    const _giftType = _selectedHolder.querySelector(`.gift > .gift-dataText`);
    const _giftFrom = _selectedHolder.querySelector(`.giftFrom > .gift-dataText`);
    const _giftTo = _selectedHolder.querySelector(`.giftTo > .gift-dataText`);
    const _giftMessage = _selectedHolder.querySelector(`.giftMessage > .gift-dataText`);

    const giftData = JSON.parse(cartNoteValue || "{}");
    _giftType.textContent = giftData.gift === "D" ? "Não, deixa comigo" : "Sim, quero embalado";
    _giftFrom.textContent = giftData?.giftFrom ?? "";
    _giftTo.textContent = giftData?.giftTo ?? "";
    _giftMessage.textContent = giftData?.giftMessage ?? "";

    _selectedHolder.style.display = cartNoteValue.length ? "flex" : "none";
    _triggerHolder.style.display = cartNoteValue.length ? "none" : "flex";
  };

  if (body && !overlayTemplateHolder) {
    const overlayTemplate = `
          <div class="gift-template-overlay" id="gift-template-overlay" style="display: none;">
            <div class="gift-template-overlay-content">
              <div class="row-fluid overlay-content-head">
                <h3 class="gift-title">Opções de presente</h3>
                <button class="close-overlay" title="Fechar Janela">
                  <span aria-hidden="true">&times;</span>
                  <span class="sr-only">Fechar Janela</span>
                </button>
              </div>

              <div class="overlay-content-main">
                <div class="gift-options">
                  <div class="gift-options-text">
                    Deseja enviar o presente embalado?
                  </div>

                  <div class="gift-options-buttons">
                    <div class="gift-options-buttonsElement">
                      <input type="radio" name="wrap-type" value="S" id="gift-wrapped" class="sr-only" checked="true" />
                      <label for="gift-wrapped">Sim, quero embalado</label>
                    </div>

                    <div class="gift-options-buttonsElement">
                      <input type="radio" name="wrap-type" value="D" id="gift-unwrapped" class="sr-only" />
                      <label for="gift-unwrapped">Não, deixa comigo</label>
                    </div>
                  </div>

                  <div class="gift-options-disclaimer">
                    *As sacolas de presente virão dobradas no pedido para você embrulhar na sua casa
                  </div>
                </div>

                <div class="overlay-content-separator"></div>

                <div class="gift-message">
                  <div class="form-group">
                    <div class="input-group gift-message-inputFrom">
                      <label for="gift-message-inputFrom">De</label>
                      <input type="text" name="gift-message-inputFrom" id="gift-message-inputFrom" required />
                    </div>
                  </div>

                  <div class="gift-message-area">
                    <div class="gift-message-info">
                      <div class="gift-message-title">Mensagem de presente</div>
                      <div class="gift-message-details">
                        <span class="char-count">400</span> caracteres
                      </div>
                    </div>

                    <div class="form-group">
                      <div class="input-group gift-message-inputMessage">
                          <textarea maxlength="400" rows="8" name="gift-message-inputMessage" id="gift-message-inputMessage" placeholder="Aproveite seu presente!" required></textarea>
                      </div>

                      <div class="input-group gift-message-inputTo">
                        <label for="gift-message-inputTo">Para</label>
                        <input type="text" name="gift-message-inputTo" id="gift-message-inputTo" required />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="clearfix pull-right cart-links">
                <button type="button" id="cancel-gift-options" class="btn btn-large pull-left-margin btn-cancel-gift-options">
                    <span class="btn-text">Cancelar</span>
                </button>
                
                <button type="submit" id="select-gift-options" class="btn btn-large pull-left-margin btn-select-gift-options btn-success">
                    <span class="btn-text">Salvar e continuar</span>
                </button>
              </div>
            </div>
          </div>
        `;

    const tempElement = document.createElement("div");
    tempElement.innerHTML = overlayTemplate;

    // Close behavior
    tempElement.querySelector(".gift-template-overlay").addEventListener("click", (e) => {
      const overlay = $("#gift-template-overlay");
      const target = $(e.target);

      if (
        target.hasClass("gift-template-overlay") ||
        target.hasClass("close-overlay") ||
        target.hasClass("btn-cancel-gift-options")
      )
        overlay.hide();
    });

    // Information field behavior
    const inputFields = tempElement.querySelectorAll("input[type='text'], textarea");

    inputFields.forEach((item) => {
      const field = $(item);

      field.blur(() => {
        if (field.val().length === 0) {
          field.parents(".input-group").addClass("warning");
        } else {
          field.parents(".input-group").removeClass("warning");
        }
      });
    });

    $(tempElement.querySelector("textarea")).on("keyup", (e) => {
      const MAX_CHAR = 400;

      const dataMessage = $(e.target).val();

      const _char = $(tempElement.querySelector(".gift-message-info .char-count"));

      _char.text(MAX_CHAR - dataMessage.length);
    });

    // Save behavior
    tempElement.querySelector(".btn-select-gift-options").addEventListener("click", () => {
      const cartNote = $("#cart-note");

      const overlay = $("#gift-template-overlay");
      const pendences = overlay.find(".input-group.warning");

      const gift = overlay.find('input[name="wrap-type"]:checked').val() ?? "N";
      const giftFrom = overlay.find('input[name="gift-message-inputFrom"]').val() ?? "";
      const giftTo = overlay.find('input[name="gift-message-inputTo"]').val() ?? "";
      const giftMessage = overlay.find('textarea[name="gift-message-inputMessage"]').val() ?? "";

      const data = {
        gift,
        giftFrom,
        giftTo,
        giftMessage,
      };

      if (pendences.length === 0) {
        cartNote.val(JSON.stringify(data));
        cartNote.trigger("change");

        handleLayoutAlternation(document);
        overlay.hide();
      } else {
        console.error("Missing data");
      }
    });

    body.prepend(tempElement);
  } else if (!cartSummaryHolder) {
    console.error("Couldn't create giftcard overlay");
  }

  if (cartSummaryHolder && !giftTriggerHolder && !giftSelectedHolder) {
    const giftTemplate = `
          <div class="gift-selected-holder" id="gift-selected-holder" style="display: none;">
            <div class="row-fluid header">
              <label class="gift-text">Opções de presente</label>

              <button class="btn btn-small btn-edit-gift-options">Alterar</button>

              <button type="reset" class="btn btn-small btn-remove-gift-options">
                <span class="btn-icon"></span>
                <span class="sr-only">Remover</span>
              </button>
            </div>
            <div class="row-fluid gift-data">
              <p class="gift-dataItem giftFrom">De: <span class="gift-dataText"></span></p>
              <p class="gift-dataItem gift">Embalagem: <span class="gift-dataText"></span></p>
              <p class="gift-dataItem giftMessage">Mensagem: <span class="gift-dataText"></span></p>
              <p class="gift-dataItem giftTo">Para: <span class="gift-dataText"></span></p>
            </div>
          </div>

          <div class="gift-trigger-holder" id="gift-trigger-holder">
            <div class="row-fluid summary">
              <label class="gift-text">
                Que tal mandar um presente com uma embalagem e um cartão todo especial?
              </label>
            </div>
            <div class="clearfix pull-right cart-links">
                <button type="submit" id="choose-gift-options" class="btn btn-large pull-left-margin btn-choose-gift-options">
                    <span class="btn-icon"></span>
                    <span class="btn-text">Esse pedido é um presente?</span>
                </button>
            </div>
          </div>
        `;

    const tempElement = document.createElement("div");
    tempElement.classList.add("gift-template-holder");
    tempElement.setAttribute("id", "gift-template-holder");
    tempElement.innerHTML = giftTemplate;

    // Check layout
    handleLayoutAlternation(tempElement);

    tempElement.querySelector(".btn-remove-gift-options").addEventListener("click", () => {
      const cartNote = $("#cart-note");

      cartNote.val("");
      cartNote.trigger("change");

      handleLayoutAlternation(tempElement);
    });

    const handleOverlay = () => {
      const overlay = $("#gift-template-overlay");
      const cartNote = $("#cart-note");

      // initialize saved values
      if (cartNote && overlay) {
        const giftData = JSON.parse(cartNote.val() || "{}");

        if (giftData.hasOwnProperty("gift")) {
          overlay.find(`input[value="${giftData.gift}"]`).attr("checked", true);
        } else {
          overlay.find(`input[name="wrap-type"]:first-child`).attr("checked", true);
        }

        overlay.find('input[name="gift-message-inputFrom"]').val(giftData?.giftFrom ?? "");

        overlay.find('input[name="gift-message-inputTo"]').val(giftData?.giftTo ?? "");

        overlay.find('textarea[name="gift-message-inputMessage"]').val(giftData?.giftMessage ?? "");
        overlay.find('textarea[name="gift-message-inputMessage"]').trigger("keyup");
      }

      overlay.show();
    };

    tempElement.querySelector(".btn-edit-gift-options").addEventListener("click", handleOverlay);
    tempElement.querySelector(".btn-choose-gift-options").addEventListener("click", handleOverlay);

    cartSummaryHolder.prepend(tempElement);
  } else if (!cartSummaryHolder) {
    console.error("Couldn't create giftcard options");
  }
};

// Check changes
if (window.location.hash === "#/cart") {
  createGiftOptions();
}

window.addEventListener("load", () => {
  if (window.location.hash === "#/cart") {
    createGiftOptions();
  }
});

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#/cart") {
    createGiftOptions();
  }
});

// Metricaz dataLayer events
// Payment methods
$(document).on("click", ".payment-group-list-btn > a", (e) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "checkoutOption",
    eventCategory: "enhanced-ecommerce",
    eventAction: "checkoutOption",
    eventLabel: "payment-method",
    ecommerce: {
      checkout_option: {
        actionField: {
          step: "5",
          option: `payment:${$(e.currentTarget).text().trim()}`,
        },
      },
    },
  });
});

// Shipping methods
$(document).on("click", ".vtex-omnishipping-1-x-leanShippingOption", (e) => {
  const _opcao = $(e.currentTarget).find(".vtex-omnishipping-1-x-leanShippingTextLabel").text();

  const _previsao = $(e.currentTarget).find(".shp-option-text-package").text();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "checkoutOption",
    eventCategory: "enhanced-ecommerce",
    eventAction: "checkoutOption",
    eventLabel: "shipping-method",
    ecommerce: {
      checkout_option: {
        actionField: {
          step: "4",
          option: `shipping:${_opcao}:${_previsao}`,
        },
      },
    },
  });
});

// Add coupon
$(document).on("click", "#cart-coupon-add", () => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "event",
    eventCategory: "imaginarium:checkout",
    eventAction: "interacao:campo",
    eventLabel: "sucesso",
  });
});

// @TODO Vales utilizados só separa após recarregar, não realiza a separação no momento da ativação
// TodoCartoes & Giftcard provider for VTEX
const GiftCardTodosCartoes = {
  methods: {
    createHTML() {
      const _this = this;
      const giftCardElement = document.querySelector(".giftCard");
      const interval = setInterval(() => {
        const elementToAppendAfter = document.querySelector("#payment-data form p.link.link-gift-card");

        if ($("#payment-data form p.link.link-gift-card").length) {
          clearInterval(interval);
          // Append after elementToAppendAfter
          if (giftCardElement === null) {
            elementToAppendAfter.insertAdjacentHTML(
              "afterend",
              `<div class="giftCard">
                <div class="giftCard__container">
                  <span class="openOptionsGiftCard">
                    Vale presente
                    <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="39" height="24" rx="2.5" fill="white" stroke="#DDDDDD" />
                    <path
                      d="M30.5967 10.3837C30.8167 10.2326 31 9.96802 31 9.6657V7.625C31 6.71802 30.3033 6 29.4233 6H24.4733C24.1433 6 23.9233 6.15116 23.7767 6.4157C23.4467 6.90698 22.75 6.90698 22.4567 6.4157C22.3833 6.18895 22.0533 6 21.8333 6H10.5767C9.69667 6 9 6.71802 9 7.625V9.74128C9 10.0814 9.14667 10.3081 9.40333 10.4593C10.1 10.875 10.5767 11.593 10.5767 12.5C10.5767 13.407 10.1 14.125 9.40333 14.6163C9.14667 14.7674 9 14.9942 9 15.2587V17.375C9 18.282 9.69667 19 10.5767 19H21.7967C22.1267 19 22.3467 18.8488 22.4933 18.5843C22.8233 18.093 23.52 18.093 23.8133 18.5843C23.96 18.811 24.2167 19 24.51 19H29.3867C30.2667 19 30.9633 18.282 30.9633 17.375V15.2587C30.9633 14.9186 30.8167 14.6919 30.56 14.5407C29.8633 14.125 29.3867 13.407 29.3867 12.5C29.3867 11.593 29.9 10.875 30.5967 10.3837ZM23.9233 14.9186C23.9233 15.4099 23.5933 15.7122 23.1533 15.7122C22.6767 15.7122 22.3833 15.3721 22.3833 14.9186V14.125C22.3833 13.6337 22.7133 13.3314 23.1533 13.3314C23.63 13.3314 23.9233 13.6715 23.9233 14.125V14.9186ZM23.9233 10.875C23.9233 11.3663 23.5933 11.6686 23.1533 11.6686C22.6767 11.6686 22.3833 11.3285 22.3833 10.875V10.0814C22.3833 9.59012 22.7133 9.28779 23.1533 9.28779C23.63 9.28779 23.9233 9.62791 23.9233 10.0814V10.875Z"
                      fill="#423086" />
                    <mask id="mask-giftcard" mask-type="alpha" maskUnits="userSpaceOnUse" x="9" y="6" width="22" height="13">
                      <path
                        d="M30.5967 10.3837C30.8167 10.2326 31 9.96802 31 9.6657V7.625C31 6.71802 30.3033 6 29.4233 6H24.4733C24.1433 6 23.9233 6.15116 23.7767 6.4157C23.4467 6.90698 22.75 6.90698 22.4567 6.4157C22.3833 6.18895 22.0533 6 21.8333 6H10.5767C9.69667 6 9 6.71802 9 7.625V9.74128C9 10.0814 9.14667 10.3081 9.40333 10.4593C10.1 10.875 10.5767 11.593 10.5767 12.5C10.5767 13.407 10.1 14.125 9.40333 14.6163C9.14667 14.7674 9 14.9942 9 15.2587V17.375C9 18.282 9.69667 19 10.5767 19H21.7967C22.1267 19 22.3467 18.8488 22.4933 18.5843C22.8233 18.093 23.52 18.093 23.8133 18.5843C23.96 18.811 24.2167 19 24.51 19H29.3867C30.2667 19 30.9633 18.282 30.9633 17.375V15.2587C30.9633 14.9186 30.8167 14.6919 30.56 14.5407C29.8633 14.125 29.3867 13.407 29.3867 12.5C29.3867 11.593 29.9 10.875 30.5967 10.3837ZM23.9233 14.9186C23.9233 15.4099 23.5933 15.7122 23.1533 15.7122C22.6767 15.7122 22.3833 15.3721 22.3833 14.9186V14.125C22.3833 13.6337 22.7133 13.3314 23.1533 13.3314C23.63 13.3314 23.9233 13.6715 23.9233 14.125V14.9186ZM23.9233 10.875C23.9233 11.3663 23.5933 11.6686 23.1533 11.6686C22.6767 11.6686 22.3833 11.3285 22.3833 10.875V10.0814C22.3833 9.59012 22.7133 9.28779 23.1533 9.28779C23.63 9.28779 23.9233 9.62791 23.9233 10.0814V10.875Z"
                        fill="#423086" />
                    </mask>
                    <g mask="url(#mask-giftcard)">
                      <rect x="23" y="6" width="8" height="13" fill="#F4519B" />
                    </g>
                  </svg>
                  </span>
                  <div class="giftCard__options">
                    <span class="closeOptionsGiftCard">+</span>
                    <div class="radioButtonsContainer">
                      <span class="radio-span is-checked" data-value="vale-compra">Vale compra</span>
                      <span class="radio-span" data-value="cartao-presente">Cartão presente</span>
                    </div>
                    <div class="formContainer">
                      <div data-form="vale-compra" class="is-active">
                        <div id="vale-compra">
                          <label for="giftCode-valeCompra">
                            Número do vale
                            <input
                              type="text"
                              class="giftcard-services-input"
                              id="giftCode-valeCompra"
                              name="giftCode-valeCompra"
                              placeholder="Vale"
                            />
                          </label>
                          <span>
                            Adicionar
                          </span>
                        </div>
                      </div>
                      <div data-form="cartao-presente">
                        <div id="cartao-presente">
                          <label for="giftCode-cartaoPresente">
                            Número do vale
                            <input
                              type="text"
                              class="giftcard-services-input"
                              id="giftCode-cartaoPresente"
                              name="giftCode-cartaoPresente"
                              placeholder="Vale"
                            />
                          </label>
                          <label for="giftPass-cartaoPresente">
                            Senha
                            <input
                              type="password"
                              class="giftcard-services-input"
                              id="giftPass-cartaoPresente"
                              name="giftPass-cartaoPresente"
                              placeholder="Senha"
                            />
                          </label>
                          <span>Adicionar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`
            );
            _this.formularyListenerSubmit();
          }
        }
      }, 150);
    },
    checkIfHaveResult() {
      $(document).on("click", ".codeSection__removeBtn", (e) => {
        const _index = $(e.currentTarget).attr("data-index");

        $($(".payment-discounts > .payment-discounts-list .remove a")[_index]).trigger("click");

        if ($(".valesUtilizados .codeSection").length > 1) {
          $(".valesUtilizados .codeSection")[_index].remove();
        } else {
          $(".valesUtilizados").remove();
        }

        if ($(".discount-giftcard").length > 1) {
          $(".discount-giftcard")[_index].remove();
        } else {
          $(".discount-giftcard-totalizers").remove();
        }
      });

      setInterval(() => {
        if (!$(".gift-card-section .payment-discounts-list table").length) {
          return;
        }

        // eslint-disable-next-line prefer-destructuring
        const code = $(
          '.gift-card-section .payment-discounts-list table tbody tr td.code[data-bind="text: redemptionCode"]'
        );

        // eslint-disable-next-line prefer-destructuring
        const value = $(
          '.gift-card-section .payment-discounts-list table tbody tr td.number[data-bind="text: valueLabel, fadeVisible: inUse"]'
        );

        try {
          if ($(".codeSection__code").length !== code.length) {
            let valueHTML = "";

            $(value).each((index) => {
              valueHTML += `
              <div class="codeSection">
                  <div class="codeSection__code" style="display: none;">${code[index].textContent}</div>
                  <div class="codeSection__title">${
                    code[index].textContent.length > 20 ? "Cartão presente" : "Vale compra"
                  }</div>
                  <div class="codeSection__value">${value[index].textContent}</div>
                  <div class="codeSection__removeBtn" data-index="${index}">Remover</div>
                </div>
              `;
            });

            $(".valesUtilizados").length === 0 &&
              $(".giftCard .formContainer").append(
                `<div class="valesUtilizados" style="display: block">
                  <span class="valesUtilizados__title">Vales utilizados</span>
                  <div class="valesUtilizados__list"></div>
                  <div class="valesUtilizados__disclaimer">Os vales que você aplicar serão utilizados como métodos de pagamento alternativos. Portanto, o valor do seu pedido será deduzido somente durante o processo de finalização da compra.</div>
                </div>`
              );

            $(".valesUtilizados__list").html(valueHTML);
          }
        } catch (error) {
          console.error(error);
        }
      }, 1000);
    },
    formularyListenerSubmit() {
      document.querySelector("span.openOptionsGiftCard").addEventListener("click", () => {
        document.querySelector("span.openOptionsGiftCard").classList.add("is-active");
        setTimeout(() => {
          document.querySelector("div.giftCard__options").classList.add("is-active");
        }, 500);
      });

      document.querySelector(".closeOptionsGiftCard").addEventListener("click", () => {
        document.querySelector("span.openOptionsGiftCard").classList.remove("is-active");
        document.querySelector("div.giftCard__options").classList.remove("is-active");
      });

      $(document).on("click", ".radioButtonsContainer .radio-span", (e) => {
        $(".radioButtonsContainer .radio-span").removeClass("is-checked");
        $(e.currentTarget).addClass("is-checked");

        if ($(e.currentTarget).attr("data-value") === "vale-compra") {
          $('div[data-form="cartao-presente"]').removeClass("is-active");
          $('div[data-form="vale-compra"]').addClass("is-active");
        }

        if ($(e.currentTarget).attr("data-value") === "cartao-presente") {
          $('div[data-form="vale-compra"]').removeClass("is-active");
          $('div[data-form="cartao-presente"]').addClass("is-active");
        }
      });

      $(document).on("click", 'div[data-form="vale-compra"] div span', () => {
        const vale = $('label[for="giftCode-valeCompra"] input').val();

        if (!$(".gift-card-provider-default #payment-discount-code").length) {
          $("#show-gift-card-group").trigger("click");
        }

        const select = $("#gift-card-provider-selector");
        const options = $("#gift-card-provider-selector option");

        options.each((_, item) => {
          if ($(item).text().trim() === "VtexGiftCard") {
            $(item).attr("selected", true);
            select.change();
          }
        });

        $(".payment-discounts-options #payment-discounts-code").val(vale);
        $(".payment-discounts-options #payment-discounts-code").change();
        $(".gift-card-multiple-providers button#btn-add-gift-card").trigger("click");

        const interval = setInterval(() => {
          if (!$(".valesUtilizados").length) return;

          clearInterval(interval);

          $('div[data-form="vale-compra"] div span').text("Adicionado!");
          $('div[data-form="vale-compra"] div span').addClass("is-active");

          setTimeout(() => {
            $('div[data-form="vale-compra"] div span').text("Adicionar");
            $('div[data-form="vale-compra"] div span').removeClass("is-active");
          }, 4000);
        }, 500);
      });

      $(document).on("click", 'div[data-form="cartao-presente"] div span', () => {
        const vale = $('label[for="giftCode-cartaoPresente"] input').val();
        const pass = $('label[for="giftPass-cartaoPresente"] input').val();

        if (!$(".gift-card-provider-default #payment-discount-code").length) {
          $("#show-gift-card-group").trigger("click");
        }

        const pubKey =
          "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWKAnUudPs6rQtnMo3OWVAPXi+8TErO2whhcqbx5YRRQ3atDb7KkYntrh/ukqotDg3aooYpFMfyXx9vYDd88yeJCBEmyO9jzGl0YKwt0CaR8Na/X70swenjgXnFEyqWK4fAs/NDcnvdJEgUt/wlxg5wDVx7PBrgYW5OUkbCG7x7wIDAQAB";

        // Set the public key
        window.encrypt.setPublicKey(pubKey);

        // Encrypt the password based on the public key
        const encrypted = window.encrypt.encrypt(pass);

        const select = $("#gift-card-provider-selector");
        const options = $("#gift-card-provider-selector option");

        options.each((_, item) => {
          if ($(item).text().trim() === "TodoCartoes") {
            $(item).attr("selected", true);
            select.change();
          }
        });

        $(".payment-discounts-options #payment-discounts-code").val(`${vale}.${encrypted}`);
        $(".payment-discounts-options #payment-discounts-code").change();
        $(".gift-card-multiple-providers button#btn-add-gift-card").trigger("click");
        const interval = setInterval(() => {
          if (!$(".valesUtilizados").length) return;

          clearInterval(interval);
          $('div[data-form="cartao-presente"] div span').text("Adicionado!");
          $('div[data-form="cartao-presente"] div span').addClass("is-active");

          setTimeout(() => {
            $('div[data-form="cartao-presente"] div span').text("Adicionar");
            $('div[data-form="cartao-presente"] div span').removeClass("is-active");
          }, 4000);
        }, 500);
      });
    },
    appendGiftCard() {
      const _this = this;

      if (window.location.hash === "#/payment") {
        _this.createHTML();
      }

      window.addEventListener("hashchange", () => {
        if (window.location.hash === "#/payment") {
          _this.createHTML();
        }
      });
    },
  },
  init() {
    this.methods.checkIfHaveResult();
    this.methods.appendGiftCard();
  },
};

// Initializer for GiftCardServices
setTimeout(() => {
  window.encrypt = new JSEncrypt();
  GiftCardTodosCartoes.init();
}, 2000);

// OpenCashback
$(window).on("orderFormUpdated.vtex", async (_, orderForm) => {
  const href = window.location.href.split("/");
  const [page] = href.splice(-1);

  if (page === "payment") {
    const giftCard = orderForm.paymentData.giftCards.find((giftCard) => giftCard.provider === "OCKSAAS");

    const usedCashback = giftCard?.value || 0;
    const response = await simulateOrder(orderForm, usedCashback);

    if (response.cashback.total > 0) {
      generateTotalElement(response.cashback.total, "payment");
    }

    generateCashbackIcon();
  } else if (page === "cart") {
    const response = await simulateOrder(orderForm);

    if (!response?.cashback.total > 0) {
      return;
    }

    response.cashback.items.map((item) => {
      const product = orderForm.items.find((product) => product.productId === item.id);

      return generateItemElement(product.id, item.amount);
    });
  }
});

const getGiftcardName = (giftcardItem) => {
  if (giftcardItem.provider === "OCKSAAS") return "Cashback";

  if (giftcardItem.name === "Gerado automaticamente") return "Vale Troca";

  return "Vale Compra";
};

// GiftCards
$(window).on("orderFormUpdated.vtex", async (_, orderForm) => {
  const href = window.location.href.split("/");
  const [page] = href.splice(-1);

  if (page === "payment") {
    const giftCard = orderForm.paymentData.giftCards;
    const totalGiftCards = orderForm.paymentData.giftCards.reduce((total, giftcard) => total + giftcard.value, 0);

    // Removes existing content to prevent outdated values
    $(".discount-giftcard-totalizers").remove();

    let totalizersHTML = "";

    $(giftCard).each((_, item) => {
      if (item.inUse === false) return;

      totalizersHTML += `
      <tr
        class="discount-giftcard"
        data-bind="visible: visible, attr: { 'class': id }"
        class="Items"
      >
        <td class="info" data-bind="{text: label()}">
        ${getGiftcardName(item)}
        </td>

        <td class="space" />
        <td class="monetary" data-bind="text: valueLabel">
          -${formatAmount(item.value)}
        </td>
        <td class="empty" />
      </tr>
      `;
    });

    totalizersHTML &&
      $(".cart-template.mini-cart .totalizers-list").after(
        `<tbody class="discount-giftcard-totalizers">${totalizersHTML}</tbody>`
      );

    var interval = setInterval(() => {
      const totalizer = $(".cart-template.mini-cart.span4 tfoot .monetary").first();

      if ($(totalizer).text() === formatAmount(Math.abs(orderForm.value - totalGiftCards))) clearInterval(interval);

      $(totalizer).text(formatAmount(Math.abs(orderForm.value - totalGiftCards)));
    }, 500);
  }
});

const generateTotalElement = (total, page) => {
  const params = getParamsToTotalElementFromPage(page);

  const element = `
    <tr id="${params.id}">
      <td class="iconAndText">
        <div class="icon"></div>
        <div class="text"></div>
      </td>
      <td class="monetary">${formatAmount(total)}</td>
    </tr>
  `;

  $(`#${params.id}`).remove();
  $(params.class).append(element);
};

const generateItemElement = (sku, cashback) => {
  const item = $(".product-item")
    .toArray()
    .find((item) => $(item).data().sku == sku);

  const id = `ocb-item-cashback-${sku}`;
  const element = `
    <div id="${id}" class="item-container btn-mini">
      <img class="item-icon" /img>
      <span class="item-amount">Ganhe <strong>${formatAmount(cashback)} de cashback</strong></span>
    </div>
  `;

  $(`#${id}`).remove();

  $(item).find(".brand").before(element);
};

const getParamsToTotalElementFromPage = (page = "cart") => {
  if (page === "cart") {
    return {
      id: "ocb-total-cashback-cart",
      class: ".cart-template.full-cart tfoot",
    };
  }

  return {
    id: "ocb-total-cashback-payment",
    class: ".cart-template.mini-cart.span4 tfoot",
  };
};

const formatAmount = (value) => {
  return new Intl.NumberFormat("pt-br", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};

const simulateOrder = async (orderForm, usedCashback = 0) => {
  try {
    const items = orderForm.items.map((item) => {
      return {
        id: item.productId,
        quantity: item.quantity,
        price: Math.round(item.sellingPrice * item.quantity),
        description: item.name,
      };
    });

    const discounts = orderForm.totalizers.find((item) => item.id === "Discounts");
    const shipping = orderForm.totalizers.find((item) => item.id === "Shipping");
    const total = shipping ? orderForm.value - shipping.value : orderForm.value;

    const totalPaid = total - usedCashback;

    let order = {
      items,
      total,
      total_paid: totalPaid,
      shipping: shipping?.value || 0,
      discounts: Math.abs(discounts?.value) || 0,
    };

    if (usedCashback) {
      order = {
        ...order,
        used_cashback: usedCashback,
      };
    }

    const request = await fetch(`${window.location.origin}/api/io/_v/simulateOrder`, {
      method: "POST",
      body: JSON.stringify(order),
    });

    if (!request.ok) {
      return;
    }

    return await request.json();
  } catch (e) {
    return {};
  }
};

const generateCashbackIcon = () => {
  const icon = `
    <div id="OCKSAAS" class="opencashback-currency">
      <img class="opencashback-currency-icon" /img>
    </div>
  `;

  const columns = `
  <td class="fill-column"></td>
  <td class="fill-column"></td>
  `;

  $(".fill-column").remove();
  $(".fill-column").remove();
  $("#OCKSAAS").remove();
  $(".gift-card-provider-group-ocksaas tbody tr:eq(1)").prepend(icon);
  $(".partialValue").parent().prepend(columns);
};
