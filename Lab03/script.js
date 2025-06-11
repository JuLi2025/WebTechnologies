document.addEventListener("DOMContentLoaded",function(){
  const input = document.querySelector(".name-product input");
  const addButton = document.querySelector(".product-button");
  const leftBlock = document.querySelector(".left-block");

  function createProductItem(name){
    const productItem = document.createElement("div");
    productItem.className = "product-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "product-name";
    nameSpan.textContent = name;

    setNameEditHandler(nameSpan);

    const quantityWrapper = document.createElement("div");
    quantityWrapper.className = "quantity-wrapper";

    const minusButton = document.createElement("button");
    minusButton.className = "red-button";
    minusButton.setAttribute("data-tooltip", "Зменшити кількість");
    minusButton.textContent = "-";

    const quantityInnerWrapper = document.createElement("div");
    quantityInnerWrapper.className = "quantity-wrapper";

    const quantitySpan = document.createElement("span");
    quantitySpan.className = "quantity";
    quantitySpan.textContent = "1";

    quantityInnerWrapper.appendChild(quantitySpan);

    const plusButton = document.createElement("button");
    plusButton.className = "green-button";
    plusButton.setAttribute("data-tooltip", "Збільшити кількість");
    plusButton.textContent = "+";

    setQuantityHandlers(minusButton, plusButton, quantitySpan);

    quantityWrapper.appendChild(minusButton);
    quantityWrapper.appendChild(quantityInnerWrapper);
    quantityWrapper.appendChild(plusButton);

    const cont = document.createElement("div");
    cont.className = "cont";

    const boughtButton = document.createElement("button");
    boughtButton.className = "btn1 bought";
    boughtButton.setAttribute("data-tooltip", "Позначити як куплено")
    boughtButton.textContent = "Куплено";

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-delate";
    deleteButton.setAttribute("data-tooltip", "Видалити товар");
    deleteButton.textContent = "×";

    setDeleteButtonHandler(deleteButton);

    cont.appendChild(boughtButton);
    cont.appendChild(deleteButton);

    setBoughtButtonHandler(boughtButton);


    productItem.appendChild(nameSpan);
    productItem.appendChild(quantityWrapper);
    productItem.appendChild(cont);

    leftBlock.appendChild(productItem);
    }
  
    
    function addProduct(){
      const name = input.value.trim();
      if(name !== ""){
        createProductItem(name);
        input.value = "";
        input.focus();
        updateStatistics();
        saveState();
      }
    }

      

    addButton.addEventListener("click", addProduct);
    input.addEventListener("keydown", function(event){
      if(event.key === "Enter"){
        addProduct();
      }
    })

    function setDeleteButtonHandler(button){
        button.addEventListener("click", function(){
            const productItem = button.closest(".product-item");
            if(productItem){
                productItem.remove();
                updateStatistics();
                saveState();
            }

        })
    }

    function setBoughtButtonHandler(button){
        button.addEventListener("click", function(){
            const productItem = button.closest(".product-item");
            const nameSpan = productItem.querySelector(".product-name");
            const minusButton = productItem.querySelector(".red-button");
            const plusButton = productItem.querySelector(".green-button");
            const deleteButton = productItem.querySelector(".btn-delate");
    
            const isBought = productItem.classList.contains("bought");
            if (!isBought) {
                productItem.classList.add("bought");
                nameSpan.style.textDecoration = "line-through";
                minusButton.style.display = "none";
                plusButton.style.display = "none";
                deleteButton.style.display = "none";
                button.textContent = "Не куплено";
                button.setAttribute("data-tooltip", "Зробити не купленим");
            } else {
                productItem.classList.remove("bought");
                nameSpan.style.textDecoration = "none";
                minusButton.style.display = "";
                plusButton.style.display = "";
                deleteButton.style.display = "";
                button.textContent = "Куплено";
                button.setAttribute("data-tooltip", "Позначити як куплено");
            }
            updateStatistics();
            saveState();
        });
    }

    const existingDeleteButtons = document.querySelectorAll(".btn-delate");
    existingDeleteButtons.forEach(setDeleteButtonHandler);  

    const existingBoughtButtons = document.querySelectorAll(".btn1.bought");
    existingBoughtButtons.forEach(setBoughtButtonHandler);

    function setNameEditHandler(nameSpan){
        nameSpan.addEventListener("click",function(){
            const productItem = nameSpan.closest(".product-item");

            if(productItem.classList.contains("bought")) return;

            const currentName = nameSpan.textContent;
            const inputEdit = document.createElement("input");
            inputEdit.type = "text";
            inputEdit.value = currentName;
            inputEdit.className = "edit-name-input";

            nameSpan.replaceWith(inputEdit);
            inputEdit.focus();

            inputEdit.addEventListener("blur", function(){
                const newName = inputEdit.value.trim() || currentName;
                const newNameSpan = document.createElement("span");
                newNameSpan.className = "product-name";
                newNameSpan.textContent = newName;

                setNameEditHandler(newNameSpan);
                inputEdit.replaceWith(newNameSpan);
                updateStatistics();
                saveState();
            })

            inputEdit.addEventListener("keydown", function(event){
                if(event.key === "Enter"){
                    inputEdit.blur();
                }
            })
        })
    }
    const existingNameSpans = document.querySelectorAll(".product-name");
    existingNameSpans.forEach(setNameEditHandler);

    function setQuantityHandlers(minusButton, plusButton, quantitySpan){
        function updateButtonsState(){
            const count = parseInt(quantitySpan.textContent, 10);
            minusButton.disabled = count <= 1;
        }
        plusButton.addEventListener("click" , function(){
            const productItem = minusButton.closest(".product-item");
            if(productItem.classList.contains("bought")) return;

            let count = parseInt(quantitySpan.textContent, 10);
            count++;
            quantitySpan.textContent = count;
            updateButtonsState();
            updateStatistics();
            saveState();
        })

        minusButton.addEventListener("click", function(){
            const productItem = minusButton.closest(".product-item");
            if(productItem.classList.contains("bought")) return;

            let count = parseInt(quantitySpan.textContent, 10);
            if(count > 1){
                count--;
                quantitySpan.textContent = count;
                updateButtonsState();
                updateStatistics();
                saveState();
            }
        })
        updateButtonsState();
    }

    const existingProductItems = document.querySelectorAll(".product-item");
    existingProductItems.forEach(function(item){
        const minusButton = item.querySelector(".red-button");
        const plusButton = item.querySelector(".green-button");
        const quantitySpan = item.querySelector(".quantity");
        setQuantityHandlers(minusButton, plusButton, quantitySpan);
    })

    function updateStatistics(){
        const remainingContainer = document.querySelector(".remaining");
        const boughtContainer = document.querySelector(".bought-items");
    
        Array.from(remainingContainer.children).forEach(child => {
            if (!child.matches("h3")) {
                child.remove();
            }
        });
    
        Array.from(boughtContainer.children).forEach(child => {
            if (!child.matches(".section-line, h2")) {
                child.remove();
            }
        });
    
        const remainingList = {};
        const boughtList = {};
    
        const item = document.querySelectorAll(".product-item");
    
        item.forEach(item => {
            const name = item.querySelector(".product-name").textContent.trim();
            const quantity = parseInt(item.querySelector(".quantity").textContent, 10);
            const isBought = item.classList.contains("bought");
    
            if(isBought){
                boughtList[name] = (boughtList[name] || 0) + quantity;
            } else {
                remainingList[name] = (remainingList[name] || 0) + quantity;
            }
        });
    
        for (const name in remainingList) {
            const tag = document.createElement("div");
            tag.className = "tag";
            tag.textContent = name + " ";
            const countSpan = document.createElement("span");
            countSpan.className = "count";
            countSpan.textContent = remainingList[name];
            tag.appendChild(countSpan);
            remainingContainer.appendChild(tag);
        }
    
        for (const name in boughtList) {
            const tag = document.createElement("div");
            tag.className = "tag crossed";
            tag.textContent = name + " ";
            const countSpan = document.createElement("span");
            countSpan.className = "count";
            countSpan.textContent = boughtList[name];
            tag.appendChild(countSpan);
            boughtContainer.appendChild(tag);
        }
    }

    function saveState() {
        const items = [];
        const productItems = document.querySelectorAll(".product-item");
        productItems.forEach(item => {
          const name = item.querySelector(".product-name")?.textContent || item.querySelector(".edit-name-input")?.value;
          const quantity = parseInt(item.querySelector(".quantity").textContent, 10);
          const isBought = item.classList.contains("bought");
          items.push({ name, quantity, isBought });
        });
        localStorage.setItem("shoppingList", JSON.stringify(items));
      }


    function loadState() {
        const saved = localStorage.getItem("shoppingList");
        if (saved) {
          const items = JSON.parse(saved);
          const productItems = leftBlock.querySelectorAll(".product-item");
          productItems.forEach(item => item.remove());
          
      
          items.forEach(({ name, quantity, isBought }) => {
            const productItem = document.createElement("div");
            productItem.className = "product-item";
            if (isBought) productItem.classList.add("bought");
      
            const nameSpan = document.createElement("span");
            nameSpan.className = "product-name";
            nameSpan.textContent = name;
            if (isBought) nameSpan.style.textDecoration = "line-through";
            setNameEditHandler(nameSpan);
      
            const quantityWrapper = document.createElement("div");
            quantityWrapper.className = "quantity-wrapper";
      
            const minusButton = document.createElement("button");
            minusButton.className = "red-button";
            minusButton.setAttribute("data-tooltip", "Зменшити кількість");
            minusButton.textContent = "-";
      
            const quantityInnerWrapper = document.createElement("div");
            quantityInnerWrapper.className = "quantity-wrapper";
      
            const quantitySpan = document.createElement("span");
            quantitySpan.className = "quantity";
            quantitySpan.textContent = quantity.toString();
      
            quantityInnerWrapper.appendChild(quantitySpan);
      
            const plusButton = document.createElement("button");
            plusButton.className = "green-button";
            plusButton.setAttribute("data-tooltip", "Збільшити кількість");
            plusButton.textContent = "+";
      
            setQuantityHandlers(minusButton, plusButton, quantitySpan);
            quantityWrapper.appendChild(minusButton);
            quantityWrapper.appendChild(quantityInnerWrapper);
            quantityWrapper.appendChild(plusButton);
      
            const cont = document.createElement("div");
            cont.className = "cont";
      
            const boughtButton = document.createElement("button");
            boughtButton.className = "btn1 bought";
            boughtButton.textContent = isBought ? "Не куплено" : "Куплено";
            boughtButton.setAttribute("data-tooltip", isBought ? "Зробити не купленим" : "Позначити як куплено");
      
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn-delate";
            deleteButton.setAttribute("data-tooltip", "Видалити товар");
            deleteButton.textContent = "×";
      
            setDeleteButtonHandler(deleteButton);
            setBoughtButtonHandler(boughtButton);
      
            if (isBought) {
              minusButton.style.display = "none";
              plusButton.style.display = "none";
              deleteButton.style.display = "none";
            }
      
            cont.appendChild(boughtButton);
            cont.appendChild(deleteButton);
      
            productItem.appendChild(nameSpan);
            productItem.appendChild(quantityWrapper);
            productItem.appendChild(cont);
      
            leftBlock.appendChild(productItem);
          });
        }
      }

    loadState();
    updateStatistics();
      
})