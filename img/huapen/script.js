document.addEventListener("DOMContentLoaded", function() {
  // 植物数据
  const plantsData = [
    { id: "plant1", name: "玫瑰", src: "./images/plant1.jpg" },
    { id: "plant2", name: "向日葵", src: "./images/plant2.jpg" },
    { id: "plant3", name: "仙人掌", src: "./images/plant3.jpg" },
    { id: "plant4", name: "百合", src: "./images/plant4.jpg" },
    { id: "plant5", name: "郁金香", src: "./images/plant1.jpg" },
    { id: "plant6", name: "多肉植物", src: "./images/plant1.jpg" },
    { id: "plant7", name: "兰花", src: "./images/plant1.jpg" },
    { id: "plant8", name: "薰衣草", src: "./images/plant1.jpg" }
  ];

  const plantSelectionArea = document.querySelector(".plant-selection-area");
  const plantItemsContainer = document.querySelector(".plant-items-container");
  const designArea = document.querySelector(".design-area");
  const basePot = document.getElementById("base-pot");

  let selectedPlant = null;
  let zIndexCounter = 10; // 初始z-index值

  // 初始化植物选择区
  function initPlantSelection() {
    plantsData.forEach(plant => {
      const plantItem = document.createElement("div");
      plantItem.className = "plant-item";
      plantItem.draggable = true;
      plantItem.dataset.plantId = plant.id;

      plantItem.innerHTML = `
                <img src="${plant.src}" alt="${plant.name}" draggable="false">
                <p>${plant.name}</p>
            `;

      plantItemsContainer.appendChild(plantItem);

      // 添加拖拽事件
      addDragEvents(plantItem);
    });
  }

  // 添加拖拽事件
  function addDragEvents(element) {
    element.addEventListener("dragstart", function(e) {
      e.dataTransfer.setData("plantId", this.dataset.plantId);
      e.dataTransfer.effectAllowed = "copy";
      this.style.opacity = "0.5";
    });

    element.addEventListener("dragend", function() {
      this.style.opacity = "1";
    });
  }

  // 初始化设计区域
  function initDesignArea() {
    // 设计区域放置事件
    designArea.addEventListener("dragover", function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    designArea.addEventListener("drop", function(e) {
      e.preventDefault();
      const plantId = e.dataTransfer.getData("plantId");
      if (plantId) {
        createPlant(plantId, e.clientX, e.clientY);
      }
    });

    // 点击设计区域空白处取消选择
    designArea.addEventListener("click", function(e) {
      if (e.target === this) {
        clearSelection();
      }
    });

    // 花盆不可选择
    basePot.addEventListener("click", function(e) {
      e.stopPropagation();
    });
  }

  // 创建新植物
  function createPlant(plantId, clientX, clientY) {
    const plantData = plantsData.find(p => p.id === plantId);
    if (!plantData) return;

    const plant = document.createElement("img");
    plant.className = "plant";
    plant.src = plantData.src;
    plant.dataset.plantId = plantData.id;
    plant.draggable = false;

    // 设置位置
    const rect = designArea.getBoundingClientRect();
    const x = clientX - rect.left - 40; // 减去一半宽度
    const y = clientY - rect.top - 150 - 40; // 减去工具栏高度和一半高度

    plant.style.left = `${x}px`;
    plant.style.top = `${y}px`;
    plant.style.zIndex = zIndexCounter++;

    designArea.appendChild(plant);

    // 添加交互功能
    addPlantInteractions(plant);

    // 自动选中新创建的植物
    selectPlant(plant);
  }

  // 添加植物交互功能
  function addPlantInteractions(plant) {
    // 点击选择（使用 pointerdown 替代 click 以兼容触摸设备）
    plant.addEventListener("pointerdown", function(e) {
      e.stopPropagation();
      selectPlant(this);
    });

    // 拖拽功能
    makeDraggable(plant);

    // 添加控制点（缩放和旋转）
    addControlHandles(plant); // 确保这个函数被调用
  }
  function addControlHandles(plant) {
    // 移除旧的控制点（如果存在）
    // removeControlHandles(plant);

    // 创建缩放控制点（四角）
    const positions = ["nw", "ne", "sw", "se"];
    positions.forEach(pos => {
      const handle = document.createElement("div");
      handle.className = `resize-handle ${pos}`;
      plant.appendChild(handle);
      setupResizeHandle(handle, plant, pos);
    });

    // 创建旋转控制点（顶部）
    const rotateHandle = document.createElement("div");
    rotateHandle.className = "rotate-handle";
    plant.appendChild(rotateHandle);
    setupRotateHandle(rotateHandle, plant);
  }

  function setupResizeHandle(handle, plant, position) {
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    handle.addEventListener("pointerdown", function(e) {
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = plant.offsetWidth;
      startHeight = plant.offsetHeight;
      startLeft = plant.offsetLeft;
      startTop = plant.offsetTop;

      document.addEventListener("pointermove", resize);
      document.addEventListener("pointerup", stopResize);
    });

    function resize(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // 根据控制点位置调整
      switch (position) {
        case "nw":
          newWidth = Math.max(30, startWidth - dx);
          newHeight = Math.max(30, startHeight - dy);
          newLeft = startLeft + dx;
          newTop = startTop + dy;
          break;
        case "ne":
          newWidth = Math.max(30, startWidth + dx);
          newHeight = Math.max(30, startHeight - dy);
          newTop = startTop + dy;
          break;
        case "sw":
          newWidth = Math.max(30, startWidth - dx);
          newHeight = Math.max(30, startHeight + dy);
          newLeft = startLeft + dx;
          break;
        case "se":
          newWidth = Math.max(30, startWidth + dx);
          newHeight = Math.max(30, startHeight + dy);
          break;
      }

      plant.style.width = `${newWidth}px`;
      plant.style.height = `${newHeight}px`;
      plant.style.left = `${newLeft}px`;
      plant.style.top = `${newTop}px`;
    }

    function stopResize() {
      document.removeEventListener("pointermove", resize);
      document.removeEventListener("pointerup", stopResize);
    }
  }

  function setupRotateHandle(handle, plant) {
    let startAngle, centerX, centerY;

    handle.addEventListener("pointerdown", function(e) {
      e.stopPropagation();

      const rect = plant.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
      startAngle =
        (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;

      // 获取当前旋转角度
      const transform = plant.style.transform || "";
      const match = transform.match(/rotate\(([-0-9.]+)deg\)/);
      if (match) startAngle -= parseFloat(match[1]);

      document.addEventListener("pointermove", rotate);
      document.addEventListener("pointerup", stopRotate);
    });

    function rotate(e) {
      const angle =
        (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI -
        startAngle;
      plant.style.transform = `rotate(${angle}deg)`;
    }

    function stopRotate() {
      document.removeEventListener("pointermove", rotate);
      document.removeEventListener("pointerup", stopRotate);
    }
  }

  // 使元素可拖拽
  function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag);

    function startDrag(e) {
      // 阻止事件冒泡，避免与点击选择冲突
      e.stopPropagation();

      isDragging = true;

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      const rect = element.getBoundingClientRect();
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;

      // 提高被拖拽元素的z-index
      element.style.zIndex = zIndexCounter++;

      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      const rect = designArea.getBoundingClientRect();
      let newLeft = clientX - rect.left - offsetX;
      let newTop = clientY - rect.top - offsetY;

      // 边界检查
      const maxLeft = rect.width - element.offsetWidth;
      const maxTop = rect.height - element.offsetHeight;

      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
    }

    function endDrag() {
      isDragging = false;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchend", endDrag);
    }
  }

  // 选择植物
  // function selectPlant(plant) {
  //   clearSelection();

  //   selectedPlant = plant;
  //   plant.classList.add("selected");

  //   // 添加操作按钮
  //   addActionButtons(plant);
  // }
  function selectPlant(plant) {
    clearSelection();

    // 提高选中元素的z-index
    plant.style.zIndex = zIndexCounter++;
    plant.classList.add("selected");

    addActionButtons(plant);
    addControlHandles(plant); // 确保控制点被添加
  }

  // 添加操作按钮
  function addActionButtons(plant) {
    // 底部按钮组
    const bottomActions = document.createElement("div");
    bottomActions.className = "bottom-actions";

    // 导出按钮
    const exportBtn = document.createElement("button");
    exportBtn.className = "action-btn";
    exportBtn.title = "导出设计";
    exportBtn.innerHTML = "📤";
    exportBtn.onclick = exportDesign;
    bottomActions.appendChild(exportBtn);

    // 复制按钮
    const copyBtn = document.createElement("button");
    copyBtn.className = "action-btn";
    copyBtn.title = "复制植物";
    copyBtn.innerHTML = "⎘";
    copyBtn.onclick = () => clonePlant(plant);
    bottomActions.appendChild(copyBtn);

    // 删除按钮
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn";
    deleteBtn.title = "删除植物";
    deleteBtn.innerHTML = "🗑";
    deleteBtn.onclick = () => {
      plant.remove();
      clearSelection();
    };
    bottomActions.appendChild(deleteBtn);

    plant.appendChild(bottomActions);

    // 右侧按钮组
    const rightActions = document.createElement("div");
    rightActions.className = "right-actions";

    // 置顶按钮
    const bringToFrontBtn = document.createElement("button");
    bringToFrontBtn.className = "action-btn";
    bringToFrontBtn.title = "置顶";
    bringToFrontBtn.innerHTML = "⬆";
    bringToFrontBtn.onclick = () => bringToFront(plant);
    rightActions.appendChild(bringToFrontBtn);

    // 向上一层
    const bringForwardBtn = document.createElement("button");
    bringForwardBtn.className = "action-btn";
    bringForwardBtn.title = "向上一层";
    bringForwardBtn.innerHTML = "↑";
    bringForwardBtn.onclick = () => bringForward(plant);
    rightActions.appendChild(bringForwardBtn);

    // 向下一层
    const bringBackwardBtn = document.createElement("button");
    bringBackwardBtn.className = "action-btn";
    bringBackwardBtn.title = "向下一层";
    bringBackwardBtn.innerHTML = "↓";
    bringBackwardBtn.onclick = () => bringBackward(plant);
    rightActions.appendChild(bringBackwardBtn);

    plant.appendChild(rightActions);
  }

  // 清除选择
  function clearSelection() {
    if (selectedPlant) {
      selectedPlant.classList.remove("selected");

      // 移除操作按钮
      const bottomActions = selectedPlant.querySelector(".bottom-actions");
      const rightActions = selectedPlant.querySelector(".right-actions");
      if (bottomActions) bottomActions.remove();
      if (rightActions) rightActions.remove();

      selectedPlant = null;
    }
  }

  // 置顶
  function bringToFront(plant) {
    plant.style.zIndex = zIndexCounter++;
  }

  // 向上一层
  function bringForward(plant) {
    const currentZ = parseInt(plant.style.zIndex || 10);
    const plants = Array.from(
      document.querySelectorAll(".plant:not(#base-pot)")
    );

    // 找到在当前植物之上的最小z-index
    let minAbove = Infinity;
    plants.forEach(p => {
      if (p === plant) return;
      const z = parseInt(p.style.zIndex || 10);
      if (z > currentZ && z < minAbove) {
        minAbove = z;
      }
    });

    if (minAbove !== Infinity) {
      // 交换z-index
      const abovePlant = plants.find(
        p => parseInt(p.style.zIndex || 10) === minAbove
      );
      abovePlant.style.zIndex = currentZ;
      plant.style.zIndex = minAbove;
    } else if (currentZ < zIndexCounter - 1) {
      // 没有更高的植物，直接增加z-index
      plant.style.zIndex = currentZ + 1;
    }
  }

  // 向下一层
  function bringBackward(plant) {
    const currentZ = parseInt(plant.style.zIndex || 10);
    const plants = Array.from(
      document.querySelectorAll(".plant:not(#base-pot)")
    );

    // 花盆的z-index是1，不能低于这个值
    if (currentZ <= 2) return;

    // 找到在当前植物之下的最大z-index
    let maxBelow = -Infinity;
    plants.forEach(p => {
      if (p === plant) return;
      const z = parseInt(p.style.zIndex || 10);
      if (z < currentZ && z > maxBelow) {
        maxBelow = z;
      }
    });

    if (maxBelow !== -Infinity) {
      // 交换z-index
      const belowPlant = plants.find(
        p => parseInt(p.style.zIndex || 10) === maxBelow
      );
      belowPlant.style.zIndex = currentZ;
      plant.style.zIndex = maxBelow;
    } else if (currentZ > 2) {
      // 没有更低的植物，直接减少z-index
      plant.style.zIndex = currentZ - 1;
    }
  }

  // 克隆植物
  function clonePlant(plant) {
    const clone = plant.cloneNode(true);
    clone.style.left = `${parseInt(plant.style.left) + 20}px`;
    clone.style.top = `${parseInt(plant.style.top) + 20}px`;
    clone.style.zIndex = zIndexCounter++;
    clone.classList.remove("selected");

    // 移除可能存在的操作按钮
    const existingBottomActions = clone.querySelector(".bottom-actions");
    const existingRightActions = clone.querySelector(".right-actions");
    if (existingBottomActions) existingBottomActions.remove();
    if (existingRightActions) existingRightActions.remove();

    designArea.appendChild(clone);

    // 添加交互功能
    addPlantInteractions(clone);

    // 选择克隆的植物
    selectPlant(clone);
  }

  // 导出设计
  function exportDesign() {
    // 这里可以实现导出为图片或其他格式的功能
    alert("设计已导出 (实际实现会保存为图片)");
  }

  // 初始化
  initPlantSelection();
  initDesignArea();
});
