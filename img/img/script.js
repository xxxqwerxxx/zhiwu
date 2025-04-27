document.addEventListener("DOMContentLoaded", () => {
  // 元素
  const canvas = document.getElementById("canvas");
  const plantItems = document.querySelectorAll(".plant-item");

  // 当前选中的植物元素
  let selectedPlant = null;
  let plantIdCounter = 0;

  // 创建背景圆点
  createBackgroundDots();

  // 初始化拖拽功能
  initDragAndDrop();

  // 创建背景黄色圆点
  function createBackgroundDots() {
    const dotsContainer = document.createElement("div");
    dotsContainer.className = "background-dots";

    // 创建大约30个随机位置的圆点
    for (let i = 0; i < 30; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.opacity = Math.random() * 0.5 + 0.2;
      dotsContainer.appendChild(dot);
    }

    canvas.appendChild(dotsContainer);
  }

  // 初始化拖拽功能
  function initDragAndDrop() {
    // 为植物元素添加拖拽事件监听器
    plantItems.forEach((item) => {
      item.addEventListener("dragstart", handleDragStart);
    });

    // 画布拖拽相关事件
    canvas.addEventListener("dragover", handleDragOver);
    canvas.addEventListener("drop", handleDrop);

    // 点击画布空白区域取消选择
    canvas.addEventListener("click", (e) => {
      if (
        e.target === canvas ||
        e.target.className === "background-dots" ||
        e.target.className === "dot"
      ) {
        deselectPlant();
      }
    });
  }

  // 处理拖拽开始
  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.src);
  }

  // 处理拖拽悬停
  function handleDragOver(e) {
    e.preventDefault(); // 允许放置
  }

  // 处理放置
  function handleDrop(e) {
    e.preventDefault();

    // 获取放置的图片路径
    const imgSrc = e.dataTransfer.getData("text/plain");

    // 获取鼠标相对于画布的位置
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 创建并放置植物
    createPlant(imgSrc, x, y);
  }

  // 创建新植物元素
  function createPlant(imgSrc, x, y) {
    const plantId = `plant-${plantIdCounter++}`;

    // 创建植物容器
    const plantContainer = document.createElement("div");
    plantContainer.className = "plant";
    plantContainer.id = plantId;
    plantContainer.style.left = `${x - 30}px`;
    plantContainer.style.top = `${y - 30}px`;
    plantContainer.style.width = "60px";
    plantContainer.style.height = "60px";
    plantContainer.style.transform = "rotate(0deg)";
    plantContainer.setAttribute("data-rotation", "0");

    // 创建植物图片
    const plantImg = document.createElement("img");
    plantImg.src = imgSrc;
    plantImg.alt = "植物";
    plantContainer.appendChild(plantImg);

    // 添加到画布
    canvas.appendChild(plantContainer);

    // 添加事件监听器
    addPlantEventListeners(plantContainer);

    // 选中新创建的植物
    selectPlant(plantContainer);
  }

  // 为植物添加事件监听器
  function addPlantEventListeners(plantElement) {
    // 点击选中
    plantElement.addEventListener("mousedown", (e) => {
      if (e.target === plantElement || e.target.tagName === "IMG") {
        selectPlant(plantElement);
        e.stopPropagation();

        // 设置拖动状态
        if (!e.target.classList.contains("control-point")) {
          startDragPlant(e, plantElement);
        }
      }
    });
  }

  // 选中植物
  function selectPlant(plantElement) {
    // 先取消其他选中
    deselectPlant();

    // 标记为选中
    selectedPlant = plantElement;
    plantElement.classList.add("selected");

    // 添加控制点
    addControlPoints(plantElement);

    // 添加工具栏
    addToolbar(plantElement);
  }

  // 取消选中
  function deselectPlant() {
    if (selectedPlant) {
      selectedPlant.classList.remove("selected");

      // 移除控制点
      const controlPoints = document.querySelectorAll(".control-point");
      controlPoints.forEach((point) => point.remove());

      // 移除工具栏
      const toolbar = document.querySelector(".toolbar-plant");
      if (toolbar) toolbar.remove();

      selectedPlant = null;
    }
  }

  // 添加控制点
  function addControlPoints(plantElement) {
    // 添加旋转点
    const rotatePoint = document.createElement("div");
    rotatePoint.className = "control-point rotation-point";
    plantElement.appendChild(rotatePoint);

    // 添加缩放点（四个角）
    const corners = [
      { class: "tl", cursor: "nwse-resize" },
      { class: "tr", cursor: "nesw-resize" },
      { class: "bl", cursor: "nesw-resize" },
      { class: "br", cursor: "nwse-resize" },
    ];

    corners.forEach((corner) => {
      const resizePoint = document.createElement("div");
      resizePoint.className = `control-point resize-point ${corner.class}`;
      resizePoint.style.cursor = corner.cursor;
      plantElement.appendChild(resizePoint);

      // 添加缩放事件
      resizePoint.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        startResizePlant(e, plantElement, corner.class);
      });
    });

    // 添加旋转事件
    rotatePoint.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      startRotatePlant(e, plantElement);
    });
  }

  // 添加工具栏
  function addToolbar(plantElement) {
    const toolbar = document.createElement("div");
    toolbar.className = "toolbar-plant";

    // 工具按钮：导出、裁剪、置顶、克隆、删除
    const tools = [
      { name: "导出", icon: "⤴️" },
      { name: "裁剪", icon: "✂️" },
      { name: "置顶", icon: "⬆️" },
      { name: "克隆", icon: "🔄" },
      { name: "删除", icon: "🗑️" },
    ];

    tools.forEach((tool) => {
      const btn = document.createElement("div");
      btn.className = "tool-btn";
      btn.title = tool.name;
      btn.innerHTML = tool.icon;
      btn.dataset.action = tool.name;

      // 添加点击事件
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleToolAction(tool.name, plantElement);
      });

      toolbar.appendChild(btn);
    });

    plantElement.appendChild(toolbar);
  }

  // 处理工具栏操作
  function handleToolAction(action, plantElement) {
    switch (action) {
      case "导出":
        // 导出功能（可以在实际场景中实现为导出图片等）
        alert("导出功能");
        break;
      case "裁剪":
        // 裁剪功能
        alert("裁剪功能");
        break;
      case "置顶":
        // 将元素移到顶层
        moveToTop(plantElement);
        break;
      case "克隆":
        // 克隆植物
        clonePlant(plantElement);
        break;
      case "删除":
        // 删除植物
        deletePlant(plantElement);
        break;
    }
  }

  // 移动元素到顶层
  function moveToTop(plantElement) {
    canvas.appendChild(plantElement); // 重新添加到末尾会使元素显示在最上层
  }

  // 克隆植物
  function clonePlant(plantElement) {
    // 获取原始植物的属性
    const originalRect = plantElement.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // 计算相对于画布的位置
    const x = originalRect.left - canvasRect.left + originalRect.width / 2 + 20;
    const y = originalRect.top - canvasRect.top + originalRect.height / 2 + 20;

    // 获取图片源
    const imgSrc = plantElement.querySelector("img").src;

    // 创建新植物
    createPlant(imgSrc, x, y);

    // 复制原始植物的样式
    const newPlant = document.getElementById(`plant-${plantIdCounter - 1}`);
    newPlant.style.width = plantElement.style.width;
    newPlant.style.height = plantElement.style.height;
    newPlant.style.transform = plantElement.style.transform;
    newPlant.setAttribute(
      "data-rotation",
      plantElement.getAttribute("data-rotation")
    );
  }

  // 删除植物
  function deletePlant(plantElement) {
    plantElement.remove();
    deselectPlant();
  }

  // 开始拖动植物
  function startDragPlant(e, plantElement) {
    e.preventDefault();

    const initialX = e.clientX;
    const initialY = e.clientY;

    // 获取元素的初始位置
    const initialLeft = parseInt(plantElement.style.left) || 0;
    const initialTop = parseInt(plantElement.style.top) || 0;

    // 移动事件
    function moveElement(moveEvent) {
      const dx = moveEvent.clientX - initialX;
      const dy = moveEvent.clientY - initialY;

      plantElement.style.left = `${initialLeft + dx}px`;
      plantElement.style.top = `${initialTop + dy}px`;
    }

    // 停止拖动
    function stopDrag() {
      document.removeEventListener("mousemove", moveElement);
      document.removeEventListener("mouseup", stopDrag);
    }

    document.addEventListener("mousemove", moveElement);
    document.addEventListener("mouseup", stopDrag);
  }

  // 开始缩放植物
  function startResizePlant(e, plantElement, cornerClass) {
    e.preventDefault();

    const initialX = e.clientX;
    const initialY = e.clientY;

    // 获取元素的初始尺寸和位置
    const initialWidth = parseInt(plantElement.style.width) || 60;
    const initialHeight = parseInt(plantElement.style.height) || 60;
    const initialLeft = parseInt(plantElement.style.left) || 0;
    const initialTop = parseInt(plantElement.style.top) || 0;

    // 当前旋转角度
    const currentRotation =
      parseInt(plantElement.getAttribute("data-rotation")) || 0;

    function resizeElement(moveEvent) {
      let dx = moveEvent.clientX - initialX;
      let dy = moveEvent.clientY - initialY;

      // 考虑旋转的情况，简化处理
      if (currentRotation !== 0) {
        // 对于旋转情况，简化处理
        // 这里可以根据不同角度进行更复杂的计算
        dx =
          dx * Math.cos((currentRotation * Math.PI) / 180) +
          dy * Math.sin((currentRotation * Math.PI) / 180);
        dy =
          -dx * Math.sin((currentRotation * Math.PI) / 180) +
          dy * Math.cos((currentRotation * Math.PI) / 180);
      }

      // 根据不同角落调整大小和位置
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newLeft = initialLeft;
      let newTop = initialTop;

      switch (cornerClass) {
        case "tl": // 左上角
          newWidth = initialWidth - dx;
          newHeight = initialHeight - dy;
          newLeft = initialLeft + dx;
          newTop = initialTop + dy;
          break;
        case "tr": // 右上角
          newWidth = initialWidth + dx;
          newHeight = initialHeight - dy;
          newTop = initialTop + dy;
          break;
        case "bl": // 左下角
          newWidth = initialWidth - dx;
          newHeight = initialHeight + dy;
          newLeft = initialLeft + dx;
          break;
        case "br": // 右下角
          newWidth = initialWidth + dx;
          newHeight = initialHeight + dy;
          break;
      }

      // 设置最小尺寸限制
      if (newWidth >= 20 && newHeight >= 20) {
        plantElement.style.width = `${newWidth}px`;
        plantElement.style.height = `${newHeight}px`;
        plantElement.style.left = `${newLeft}px`;
        plantElement.style.top = `${newTop}px`;
      }
    }

    function stopResize() {
      document.removeEventListener("mousemove", resizeElement);
      document.removeEventListener("mouseup", stopResize);
    }

    document.addEventListener("mousemove", resizeElement);
    document.addEventListener("mouseup", stopResize);
  }

  // 开始旋转植物
  function startRotatePlant(e, plantElement) {
    e.preventDefault();

    // 获取元素中心点
    const rect = plantElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 计算初始角度
    const initialAngle =
      (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;

    // 获取当前旋转角度
    const currentRotation =
      parseInt(plantElement.getAttribute("data-rotation")) || 0;

    function rotateElement(moveEvent) {
      // 计算新角度
      const newAngle =
        (Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
          180) /
        Math.PI;
      const rotation = currentRotation + (newAngle - initialAngle);

      // 更新旋转
      plantElement.style.transform = `rotate(${rotation}deg)`;
      plantElement.setAttribute("data-rotation", rotation);
    }

    function stopRotate() {
      document.removeEventListener("mousemove", rotateElement);
      document.removeEventListener("mouseup", stopRotate);
    }

    document.addEventListener("mousemove", rotateElement);
    document.addEventListener("mouseup", stopRotate);
  }
});
