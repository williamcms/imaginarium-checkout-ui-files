// Shelf Config
const shelfProps = {
  // Defina as opções especificas abaixo (5) na chamada da função, evitando definir mais props
  active: true,
  wrapperClass: "",
  collectionId: "",
  shelfTitle: "",
  listName: "",
  // Define o tamanho das imagens dos produtos (use 0 para automático). Exemplo:
  // O valor 0-120 ajustará automaticamente a largura da imagem com base na altura informada.
  imageSize: "0-120",
  minProducts: 20,
  labelButton: "Adicionar",
  labelButtonProccess: "Adicionando",
  labelButtonAfter: "Adicionado",
  labelButtonUnavailable: "Indisponível",
  showUnavailable: true,
  hideOn: ["v-custom-step-email", "v-custom-step-profile", "v-custom-step-shipping", "v-custom-step-payment"],
};

// Slick Config
// Ref.: https://kenwheeler.github.io/slick/
// Exemplo de uso dos breakpoints:
// - Suponha que haja três breakpoints: 1025, 961 e 490.

// - Se mobileFirst: false,
// - Se a largura for 1025px, será aplicado o padrão definido fora do breakpoint.
// - Se a largura for 1024px, será aplicado o padrão definido dentro do breakpoint 1025.
// - Ou seja, viewport-width < breakpoint para aplica-lo e não cair no padrão de fora

// - Se mobileFirst: true,
// - Se a largura for 491px, será aplicado o padrão definido dentro do breakpoint 490.
// - Se a largura for 490px, será aplicado o padrão definido fora do breakpoint.
// - Ou seja, viewport-width > breakpoint para aplica-lo e não cair no padrão de fora
const slickProps = {
  // Defina as opções especificas abaixo (2) na chamada da função, evitando definir mais props
  active: true,
  wrapperClass: "",
  infinite: true,
  swipeToSlide: true,
  centerMode: false,
  centerPadding: "50px",
  slidesToShow: 5,
  arrows: true,
  dots: false,
  mobileFirst: false,
  respondTo: "slider",
  responsive: [
    {
      breakpoint: 1440,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 1120,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 890,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
  prevArrow: `
  <button class="slick-prev slick-arrow" aria-label="Anterior" type="button" style="display: inline-block;">
    <span class="btn-icon" aria-hidden="true"></span>
    <span class="sr-only">Anterior</span>
  </button>`,
  nextArrow: `
  <button class="slick-next slick-arrow" aria-label="Próximo" type="button" style="display: inline-block;">
    <span class="btn-icon" aria-hidden="true"></span>
    <span class="sr-only">Próximo</span>
  </button>`,
};

// Gift Config
const giftProps = {
  active: true,
};

// Initializers
window.addEventListener("load", () => {
  // List elements to initialize shelf component
  renderProductShelf({
    ...shelfProps,
    active: true,
    wrapperClass: ".e-header > .shelfContainer",
    collectionId: "1462",
    shelfTitle: "Que tal complementar o presente?",
    listName: "shelf-top-checkout",
  });
  renderProductShelf({
    ...shelfProps,
    active: true,
    wrapperClass: ".footer > .shelfContainer",
    collectionId: "1437",
    shelfTitle: "Conheça os mascotinhos",
    listName: "shelf-bottom-checkout",
  });

  // List elements to initialize slick-carousel
  buildSlick({ ...slickProps, active: true, wrapperClass: ".e-header .productListage[data-collection]" });
  buildSlick({ ...slickProps, active: true, wrapperClass: ".footer .productListage[data-collection]" });

  // Initialize gift-wrap
  createGiftOptions(giftProps);
});

// Check and initialize gift-wrap on page change
window.addEventListener("hashchange", () => {
  createGiftOptions(giftProps);
});

// Format prices to R$
const { format: parsePrice } = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatAmount = (value) => parsePrice(value / 100);

// Helper function to create elements
const createElement = (tag, attributes, children) => {
  const elm = document.createElement(tag);

  for (const key in attributes) {
    if (key === "className") {
      elm.setAttribute("class", attributes[key]);
    } else {
      elm.setAttribute(key, attributes[key]);
    }
  }

  if (children) {
    if (typeof children === "string") {
      elm.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (typeof child === "string") {
          elm.appendChild(document.createTextNode(child));
        } else {
          elm.appendChild(child);
        }
      });
    } else {
      elm.appendChild(children);
    }
  }

  return elm;
};

// Wait for the specified element to finish loading before proceeding
// waitForElm('.selector').then((elm) =>{});
const waitForElm = (selector) => {
  return new Promise((resolve) => {
    const checkElement = () => {
      const elm = document.querySelector(selector);
      if (elm) {
        resolve(elm);
      } else {
        requestAnimationFrame(checkElement);
      }
    };

    if (document.readyState === "complete") {
      checkElement();
    } else {
      window.addEventListener("DOMContentLoaded", checkElement);
    }
  });
};

// Fetch data and render the product shelf
const renderProductShelf = (props) => {
  const {
    active = false,
    wrapperClass = "",
    collectionId = "",
    shelfTitle = "",
    listName = "",
    imageSize = "0-120",
    minProducts = 20,
    labelButton = "Adicionar",
    labelButtonProccess = "Adicionando",
    labelButtonAfter = "Adicionado",
    labelButtonUnavailable = "Indisponível",
    showUnavailable = true,
    hideOn = [],
  } = props;

  if (!active) return;

  const _wrapperContainer = document.querySelector(wrapperClass);

  // Definir mais que 50 retorna um erro da API
  const MIN_PROD = 1;
  const MAX_PROD = 50;

  const useAvailable = showUnavailable ? `` : `&fq=isAvailablePerSalesChannel_1:true`;
  const useRange = `&_from=0&_to=${Math.min(Math.max(parseInt(minProducts), MIN_PROD), MAX_PROD) - 1}`;

  // https://developers.vtex.com/docs/api-reference/search-api?endpoint=get-/api/catalog_system/pub/products/search
  fetch(`/api/catalog_system/pub/products/search/${collectionId}/?map=productClusterIds${useAvailable}${useRange}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("An error occurred while retrieving the collection:", response);
      }
      return response.json();
    })
    .then((data) => {
      const products = data;

      const _titleElm = document.createRange().createContextualFragment(shelfTitle);

      const _productListage = createElement("div", { class: "productListage" });
      const _shelfTitleElement = createElement("h2", { class: "shelfTitleElement" }, _titleElm);
      const _shelfTitle = createElement("div", { class: "shelfTitle" }, _shelfTitleElement);
      const _shelfWrapper = createElement("div", { class: "shelfWrapper" }, [_shelfTitle, _productListage]);

      _productListage.setAttribute("data-collection", collectionId);
      _productListage.setAttribute("data-maxItems", minProducts);

      products.forEach((productItem) => {
        const {
          productId,
          productName,
          brand,
          items: [
            {
              itemId,
              images: [{ imageUrl }],
              sellers: [
                {
                  sellerId,
                  commertialOffer: { Price, AvailableQuantity },
                },
              ],
            },
          ],
          categories: [category],
        } = productItem;

        if (!showUnavailable && AvailableQuantity === 0) return;

        const labelToShow = AvailableQuantity ? labelButton : labelButtonUnavailable;
        const labelAttr = { class: "addToCartButton", ...(AvailableQuantity ? {} : { disabled: true }) };
        const imageId = imageUrl.match(/ids\/\d+/g)?.[0];
        const responsiveImage = !imageId ? imageUrl : imageUrl.replace(/ids\/\d+/g, `${imageId}-${imageSize}`);

        const _productWrapper = createElement("div", { class: "productWrapper" });
        const _productItem = createElement("article", {
          class: "productItem",
          "data-productName": productName,
          "data-productId": productId,
          "data-price": Price,
          "data-brand": brand,
          "data-category": category,
          "data-sku": itemId,
          "data-sellerId": sellerId,
          "data-quantity": 1,
        });

        const _productImage = createElement("div", { class: "productImage" });
        const _imageElement = createElement("img", { src: responsiveImage, alt: productName, class: "imageElement" });
        _productImage.appendChild(_imageElement);

        const productInfo = createElement("div", { class: "productInfo" });

        const _productName = createElement("h3", { class: "productName" }, productName);
        const _productNameWrapper = createElement("div", { class: "productNameWrapper" }, _productName);
        productInfo.appendChild(_productNameWrapper);

        const _productPrice = createElement("strong", { class: "productPrice" }, parsePrice(Price));
        const _productPriceWrapper = createElement("div", { class: "productPriceWrapper" }, _productPrice);
        productInfo.appendChild(_productPriceWrapper);

        const _addToCartButton = createElement("button", labelAttr, labelToShow);

        const _addToCartWrapper = createElement("div", { class: "addToCartWrapper" }, _addToCartButton);
        productInfo.appendChild(_addToCartWrapper);

        _productItem.appendChild(_productImage);
        _productItem.appendChild(productInfo);

        _productWrapper.appendChild(_productItem);

        _productListage.appendChild(_productWrapper);
      });

      _wrapperContainer.appendChild(_shelfWrapper);

      // Trigger dataLayer event for productImpressions
      window.dataLayer = window.dataLayer || [];
      const productImpressions = {
        event: "productImpressions",
        eventCategory: "enhanced-ecommerce",
        eventAction: "productImpression",
        noInteraction: 1,
        ecommerce: {
          impressions: [
            products.map((product, index) => {
              return {
                name: product.productName,
                id: product.productId,
                price: product.items[0].sellers[0].commertialOffer.Price,
                category: product.categories[0].replace(/[^\w ]/g, ""),
                brand: product.items[0].sellers[0].sellerName,
                list: listName,
                position: index + 1,
                dimension1: product.productReference,
                dimension2: product.productReference,
                dimension3: product.items[0].name,
                variant: product.items[0].itemId,
              };
            }),
          ].flat(),
        },
      };

      window.dataLayer.push(productImpressions);
    })
    .catch((error) => {
      console.error("There was a problem fetching the data:", error);
    });

  _wrapperContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("addToCartButton")) return;

    const buttonElm = e.target;
    const parentElm = buttonElm.closest(".productItem");

    const name = parentElm.getAttribute("data-productName");
    const id = parentElm.getAttribute("data-productId");
    const price = parentElm.getAttribute("data-price");
    const brand = parentElm.getAttribute("data-brand");
    const category = parentElm.getAttribute("data-category");
    const variant = parentElm.getAttribute("data-sku");
    const seller = parentElm.getAttribute("data-sellerId");
    const quantity = parseInt(parentElm.getAttribute("data-quantity")) ?? 1;

    // Add some style to represent that the click worked
    $(`.productItem[data-sku="${variant}"] .addToCartButton`).addClass("load");
    $(`.productItem[data-sku="${variant}"] .addToCartButton`).text(labelButtonProccess);

    // Set quantity
    $(`.productItem[data-sku="${variant}"]`).attr("data-quantity", quantity + 1);

    // Push dataLayer event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "addToCart",
      eventCategory: "enhanced-ecommerce",
      eventAction: "addToCart",
      ecommerce: {
        add: {
          products: [
            {
              name,
              id,
              price,
              brand,
              category,
              variant,
              quantity,
              list: listName,
            },
          ],
        },
      },
    });

    // vtexjs.checkout.addToCart(items, expectedOrderFormSections, salesChannel)
    vtexjs.checkout
      .addToCart(
        [
          {
            id: variant,
            quantity,
            seller,
          },
        ],
        null,
        1
      )
      .done(() => {
        // Execute action on all elements because the addToCart checkout
        // function triggers 'done' only after all click actions are completed
        // and the products are added to the minicart
        $(".addToCartButton.load").text(labelButtonAfter);
        $(".addToCartButton.load").addClass("added");
        $(".addToCartButton").removeClass("load");
      });
  });

  if (hideOn.length) {
    const hideShelf = () =>
      hideOn.every((item) => {
        if ($("body").hasClass(item)) {
          $(_wrapperContainer.querySelector(".shelfWrapper")).hide();
          return false;
        } else {
          $(_wrapperContainer.querySelector(".shelfWrapper")).show();
          return true;
        }
      });

    window.addEventListener("slickload", hideShelf);
    window.addEventListener("hashchange", hideShelf);
  }
};

// Ref.: https://codepen.io/GordonLai/pen/XWjaagz
const touchScroll = (elm = "") => {
  const slider = typeof elm === "string" ? document.querySelector(elm) : elm;
  let isDown = false;
  let startX;
  let scrollLeft;

  const mouseDown = (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  };

  const mouseLeave = () => {
    isDown = false;
    slider.classList.remove("active");
  };

  const mouseUp = () => {
    isDown = false;
    slider.classList.remove("active");
  };

  const mouseMove = (e) => {
    const container = $(e.target).parents(".productListage");
    if (container.hasClass("slick-initialized")) return;
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    var prevScrollLeft = slider.scrollLeft;
    slider.scrollLeft = scrollLeft - walk;
    velX = slider.scrollLeft - prevScrollLeft;
  };

  slider.addEventListener("mousedown", (e) => mouseDown(e));
  slider.addEventListener("mouseleave", () => mouseLeave());
  slider.addEventListener("mouseup", () => mouseUp());
  slider.addEventListener("mousemove", (e) => mouseMove(e));
};

// Build slick/carousel
const buildSlick = (props) => {
  const { active = false, wrapperClass = "" } = props;

  const slickInterval = setInterval(() => {
    const wrapperElm = document.querySelector(wrapperClass);
    const script = document.querySelector("script[data-name='slick/carousel']");

    if (!wrapperElm) return;

    if (!script) {
      const slickScript = createElement("script", {
        src: "//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js",
        type: "text/javascript",
        "data-name": "slick/carousel",
      });

      const slickStyles = createElement("link", {
        href: "//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css",
        rel: "stylesheet",
        "data-name": "slick/styles",
      });

      document.head.appendChild(slickScript);
      document.head.appendChild(slickStyles);
    }

    if (script) {
      try {
        if (active) $(wrapperElm).slick(props);

        clearInterval(slickInterval);
      } catch (error) {
        console.error("There was a problem while building the slider:", error);
      }

      // Starts touch behavior in case of slick failure
      touchScroll(wrapperElm);

      // Trigger custom event
      window.dispatchEvent(new Event("slickload"));
    }
  }, 500);
};

// Render gift-wrap options
const createGiftOptions = (props) => {
  const { active = false } = props;

  if (!active) return;

  const MAX_CHAR_INPUT = 100;

  const MAX_CHAR_TEXTAREA = 400;
  const TEXTAREA_TO_TRACK_CHAR = ["gift-message-inputMessage"];

  const elmToAppend =
    window.location.hash === "#/cart" ? ".cart-template > .summary-template-holder" : ".cart-template > .cart-fixed";

  const phase = window.location.hash.replace(/[^a-zA-Z]+/g, "");

  const body = document.querySelector("body");
  const cartSummaryHolder = document.querySelector(elmToAppend);
  const giftTriggerHolder = cartSummaryHolder?.querySelector(".gift-trigger-holder");
  const giftSelectedHolder = cartSummaryHolder?.querySelector(".gift-selected-holder");
  const overlayTemplateHolder = document.querySelector("#gift-template-overlay");

  // Fake button info

  const fakeButton = (currentPhase) => {
    const buttonToFake =
      currentPhase === "payment"
        ? "Finalizar compra"
        : currentPhase === "shipping"
        ? "Ir para o pagamento"
        : "Continuar pagamento";

    return `
        <button class="submit btn btn-success btn-large btn-block fake-submit" tabindex="200">
          ${currentPhase === "payment" ? '<i class="icon-lock"></i>' : ""}
          <span>${buttonToFake}</span>
        </button>
      `;
  };

  const removeEmojis = (text) => {
    const EmojiRegex =
      /(?![*#0-9]+)[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]/gu;
    const filteredText = String(text).replace(EmojiRegex, "");

    return filteredText;
  };

  // Alternate between trigger & selected layouts
  const handleLayoutAlternation = (elm) => {
    const cartNoteValue = $("#cart-note").val();
    const _triggerHolder = elm.querySelector(".gift-trigger-holder");
    const _selectedHolder = elm.querySelector(".gift-selected-holder");

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
              <form method="POST">
                <div class="row-fluid overlay-content-head">
                  <h3 class="gift-title">Opções de presente</h3>
                  <button class="close-overlay" title="Fechar Janela">
                    <span aria-hidden="true">&times;</span>
                    <span class="sr-only">Fechar Janela</span>
                  </button>
                </div>

                <div class="overlay-content-main">
                  <div class="gift-subtitle">
                    <p>Que tal mandar um presente com uma embalagem e um cartão todo especial?</p>
                  </div>

                  <div class="gift-options" style="display:none;">
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

                    <div class="gift-options-disclaimer">*Se optar pela opção "Não, deixa comigo", as sacolas de presente virão dobradas no pedido para você embrulhar na sua casa.</div>
                  </div>

                  <div class="overlay-content-separator"></div>

                  <div class="gift-message">
                    <div class="form-group">
                      <div class="input-group gift-message-inputFrom">
                        <label for="gift-message-inputFrom">De</label>
                        <input type="text" name="gift-message-inputFrom" id="gift-message-inputFrom" maxlength="${MAX_CHAR_INPUT}" required />
                      </div>
                    </div>

                    <div class="gift-message-area">
                      <div class="gift-message-info">
                        <div class="gift-message-title">Mensagem de presente</div>
                        <div class="gift-message-details">
                          <span class="char-count">${MAX_CHAR_TEXTAREA}</span> caracteres
                        </div>
                      </div>

                      <div class="form-group">
                        <div class="input-group gift-message-inputMessage">
                            <textarea maxlength="${MAX_CHAR_TEXTAREA}" rows="7" name="gift-message-inputMessage" placeholder="Aproveite seu presente!" required>Aproveite seu presente!</textarea>
                        </div>

                        <div class="input-group gift-message-inputTo">
                          <label for="gift-message-inputTo">Para</label>
                          <input type="text" name="gift-message-inputTo" id="gift-message-inputTo" maxlength="${MAX_CHAR_INPUT}" required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="gift-disclaimer">
                    <p>
                      <span>As opções de embalagem de presente estão apenas disponíveis para produtos fornecidos e entregues pela marca <strong>imaginarium</strong></span>

                      <span class="tooltip-wrapper">
                        <span class="trigger" aria-hidden="true">?</span>
                        <span class="text sr-only">Ao comprar um produto vendido e/ou entregue por outra marca, observe que, mesmo que seja combinado com outros produtos válidos, <strong>apenas os produtos da marca imaginarium serão enviados como presente</strong>. Este benefício é exclusivo dos produtos da Imaginarium.</span>
                      </span>
                    </p>
                  </div>

                </div>

                <div class="cart-links">
                  <button type="button" class="btn btn-large pull-left-margin btn-cancel-gift-options">
                      <span class="btn-text">Cancelar</span>
                  </button>
                  
                  <button type="submit" class="btn btn-large pull-left-margin btn-select-gift-options btn-success">
                      <span class="btn-text">Salvar e continuar</span>
                  </button>
                </div>
              </form>
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
      ) {
        e.preventDefault();
        overlay.hide();
      }
    });

    window.addEventListener("keydown", (e) => {
      const overlay = $("#gift-template-overlay");
      const isOverlayActive = overlay.is(":visible");

      if (e.key !== "Escape" || !isOverlayActive) return;

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

      field.on("mouseleave change keyup", (e) => {
        const $this = e.target;
        const value = $this.value;

        // Prevent Emoji
        $this.value = removeEmojis(value);

        // Track char count on textarea
        if (TEXTAREA_TO_TRACK_CHAR.includes(item.getAttribute("name"))) {
          const _charCount = tempElement.querySelector(".gift-message-info .char-count");
          const _value = $this.value;

          _charCount.textContent = MAX_CHAR_TEXTAREA - _value.length;
        }
      });
    });

    // Save behavior
    tempElement.querySelector(".btn-select-gift-options").addEventListener("click", (e) => {
      e.preventDefault();

      const cartNote = $("#cart-note");

      const overlay = $("#gift-template-overlay");
      const form = tempElement.querySelector("form");
      const target = document.querySelectorAll(".gift-template-holder");

      const validity = form?.reportValidity();

      const gift = overlay.find('input[name="wrap-type"]:checked').val() ?? "N";
      const giftFrom = overlay.find('input[name="gift-message-inputFrom"]').val() ?? "";
      const giftTo = overlay.find('input[name="gift-message-inputTo"]').val() ?? "";
      const giftMessage = overlay.find('textarea[name="gift-message-inputMessage"]').val() ?? "";

      const data = {
        gift,
        giftFrom,
        giftTo,
        giftMessage: removeEmojis(giftMessage),
      };

      if (validity) {
        cartNote.val(JSON.stringify(data));
        cartNote.trigger("change");

        target.forEach((item) => {
          handleLayoutAlternation(item);
        });

        overlay.hide();
      } else {
        console.error("Missing data");
        $(inputFields).trigger("blur");

        return form?.reportValidity();
      }
    });

    body.prepend(tempElement);
  } else if (!cartSummaryHolder) {
    console.error("Couldn't create giftcard overlay");
  }

  if (cartSummaryHolder && !giftTriggerHolder && !giftSelectedHolder) {
    const giftTemplate = `
          <p class="fake-submit-wrap" ${phase === "email" ? 'style="display: none;"' : ""}>
            ${fakeButton(phase)}
          </p>

          <div class="gift-selected-holder" style="display: none;">
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

          <div class="gift-trigger-holder">
            <div class="row-fluid summary">
              <label class="gift-text">
                Que tal mandar um presente com uma embalagem e um cartão todo especial?
              </label>
            </div>
            <div class="cart-links">
                <button type="submit" class="btn btn-large pull-left-margin btn-choose-gift-options">
                    <span class="btn-icon"></span>
                    <span class="btn-text">Esse pedido é um presente?</span>
                </button>
            </div>
          </div>

          <div class="gift-disclaimer small">
            <p>
              <span>As opções de embalagem de presente estão apenas disponíveis para produtos fornecidos e entregues pela marca <strong>imaginarium</strong></span>

              <span class="tooltip-wrapper">
                <span class="trigger" aria-hidden="true">?</span>
                <span class="text sr-only">Ao comprar um produto vendido e/ou entregue por outra marca, observe que, mesmo que seja combinado com outros produtos válidos, <strong>apenas os produtos da marca imaginarium serão enviados como presente</strong>. Este benefício é exclusivo dos produtos da Imaginarium.</span>
              </span>
            </p>
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
      const target = document.querySelectorAll(".gift-template-holder");

      cartNote.val("");
      cartNote.trigger("change");

      target.forEach((item) => {
        handleLayoutAlternation(item);
      });
    });

    // Handle Fake Button
    tempElement.querySelector(".fake-submit-wrap")?.addEventListener("click", (e) => {
      const currentPhase = window.location.hash.replace(/[^a-zA-Z]+/g, "");

      if (currentPhase === "payment") {
        $("#payment-data-submit").click();
      } else if (currentPhase === "shipping") {
        $("#btn-go-to-payment").click();
      } else {
        $("#cart-to-orderform").click();
      }
    });

    const handleOverlay = () => {
      const overlay = $("#gift-template-overlay");
      const cartNote = $("#cart-note");

      // initialize saved values
      if (cartNote && overlay) {
        const giftData = JSON.parse(cartNote.val() || "{}");

        // Decide whether to use the saved value or the default (pre-selected) value
        const wrapSuffix = giftData?.gift ? '[value="' + giftData.gift + '"]' : ":checked";

        const _wrapType = overlay.find(`input[name="wrap-type"]${wrapSuffix}`);
        const _inputFrom = overlay.find('input[name="gift-message-inputFrom"]');
        const _inputTo = overlay.find('input[name="gift-message-inputTo"]');
        const _inputMessage = overlay.find('textarea[name="gift-message-inputMessage"]');

        _wrapType.attr("checked", true);
        _inputFrom.val(giftData?.giftFrom ?? _inputFrom.val());
        _inputTo.val(giftData?.giftTo ?? _inputTo.val());
        _inputMessage.val(giftData?.giftMessage ?? _inputMessage.val());
        _inputMessage.trigger("keyup");
      }

      overlay.show();
    };

    tempElement.querySelector(".btn-edit-gift-options").addEventListener("click", handleOverlay);
    tempElement.querySelector(".btn-choose-gift-options").addEventListener("click", handleOverlay);

    cartSummaryHolder.prepend(tempElement);
  } else if (!cartSummaryHolder) {
    console.error("Couldn't create giftcard options");
  }

  window.addEventListener("hashchange", () => {
    const currentPhase = window.location.hash.replace(/[^a-zA-Z]+/g, "");
    const fakeButtonHolder = $(".fake-submit-wrap");

    if (phase !== "email") {
      setTimeout(() => fakeButtonHolder.html(fakeButton(currentPhase)), 500);
    }
  });
};

// Fixes zip code issues since there is currently no indication of a platform fix
const handleZipCodeElm = () => waitForElm("#ship-postalCode").then((elm) => FixZipCode(elm));

handleZipCodeElm();

$(document).on("click", "#shipping-preview-container", () => handleZipCodeElm());

$(document).on("click", ".shipping-container", () => handleZipCodeElm());

const FixZipCode = (zipCodeInput) => {
  if (zipCodeInput.getAttribute("autocomplete") !== "off") {
    zipCodeInput.setAttribute("autocomplete", "off");
  }

  zipCodeInput.addEventListener("paste", (e) => e.preventDefault());
};

// Hide invisible payment methods
window.addEventListener("load", () => {
  const paymentItem = $(".payment-group-item");

  paymentItem.each((_, item) => {
    const elm = $(item);

    if (!elm.is(":visible")) {
      elm.parents(".v-custom-payment-item-wrap").hide();
    }
  });
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
