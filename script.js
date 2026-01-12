// 获取DOM元素
const initScreen = document.getElementById('initScreen');
const mainScreen = document.getElementById('mainScreen');
const playerNameInput = document.getElementById('playerName');
const initCycleDaysInput = document.getElementById('initCycleDays');
const taskStartTimeInput = document.getElementById('taskStartTime');
const taskEndTimeInput = document.getElementById('taskEndTime');
const confirmBtn = document.getElementById('confirmBtn');
const displayPlayerName = document.getElementById('displayPlayerName');
const displayPlayerRole = document.getElementById('displayPlayerRole');
const roleSelectModal = document.getElementById('roleSelectModal');
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const attributesBtn = document.getElementById('attributesBtn');
const attributesModal = document.getElementById('attributesModal');
const achievementDebugBtn = document.getElementById('achievementDebugBtn');
const achievementDebugModal = document.getElementById('achievementDebugModal');
const achievementDebugResultModal = document.getElementById('achievementDebugResultModal');
const closeAchievementDebugResultBtn = document.getElementById('closeAchievementDebugResultBtn');
const confirmAchievementDebugBtn = document.getElementById('confirmAchievementDebugBtn');
const debugGodInput = document.getElementById('debugGodInput');
const debugWolfInput = document.getElementById('debugWolfInput');
const debugHumanInput = document.getElementById('debugHumanInput');
const debugCalculateBtn = document.getElementById('debugCalculateBtn');
const debugResults = document.getElementById('debugResults');
const titlesBtn = document.getElementById('titlesBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const closeAttributesBtn = document.getElementById('closeAttributesBtn');
const closeTitlesBtn = document.getElementById('closeTitlesBtn');
const titlesModal = document.getElementById('titlesModal');
const titlesList = document.getElementById('titlesList');
const titleDetailModal = document.getElementById('titleDetailModal');
const titleDetailName = document.getElementById('titleDetailName');
const titleDetailDescriptions = document.getElementById('titleDetailDescriptions');
const closeTitleDetailBtn = document.getElementById('closeTitleDetailBtn');
const achievementResultModal = document.getElementById('achievementResultModal');
const achievementResultContent = document.getElementById('achievementResultContent');
const completedTasksList = document.getElementById('completedTasksList');
const closeAchievementResultBtn = document.getElementById('closeAchievementResultBtn');
const closeTaskDetailBtn = document.getElementById('closeTaskDetailBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const taskDetailModal = document.getElementById('taskDetailModal');
const resetCycleBtn = document.getElementById('resetCycleBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const cycleDaysInput = document.getElementById('cycleDays');
const roleCards = document.querySelectorAll('.role-card');
const tasksList = document.getElementById('tasksList');
const emptyTasks = document.getElementById('emptyTasks');
const debugTaskBtn = document.getElementById('debugTaskBtn');

// 玩家名称和身份
let playerName = '';
let playerRole = '';

// 任务相关
let taskTimer = null;
let taskIdCounter = 0;
let tasks = [];

// 成就调试相关
let currentDebugAchievements = []; // 保存当前计算的成就数组

// 属性相关
let playerAttributes = {
    wolf: 0,    // 狼性
    god: 0,     // 神性
    human: 0    // 人性
};

let radarChart = null;

// 存储键名
const STORAGE_KEYS = {
    PLAYER_NAME: 'playerName',
    LAST_ROLE_SELECT_TIME: 'lastRoleSelectTime',
    CYCLE_DAYS: 'cycleDays',
    PLAYER_ROLE: 'playerRole',
    TASK_START_TIME: 'taskStartTime',
    TASK_END_TIME: 'taskEndTime',
    TASK_FREQUENCY: 'taskFrequency',
    IS_INITIALIZED: 'isInitialized',
    TASKS: 'tasks',
    NEXT_TASK_TIME: 'nextTaskTime',
    PLAYER_ATTRIBUTES: 'playerAttributes',
    INITIAL_ATTRIBUTES: 'initialAttributes',
    TASK_DATA: 'taskData',
    ACHIEVEMENT_DATA: 'achievementData',
    UNLOCKED_TITLES: 'unlockedTitles',
    TASK_CYCLE_START_DATE: 'taskCycleStartDate',
    ACHIEVEMENT_CALCULATED: 'achievementCalculated',
    COMPLETED_TASKS_THIS_CYCLE: 'completedTasksThisCycle'
};

// 默认值
const DEFAULT_CYCLE_DAYS = 7;
const DEFAULT_TASK_START_TIME = '09:00';
const DEFAULT_TASK_END_TIME = '17:00';
const DEFAULT_TASK_FREQUENCY = 1;

// 确认按钮点击事件
confirmBtn.addEventListener('click', () => {
    handleInitSubmit();
});

// 输入框回车事件
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleInitSubmit();
    }
});

// 处理初始化提交
function handleInitSubmit() {
    const name = playerNameInput.value.trim();
    const cycleDays = parseInt(initCycleDaysInput.value);
    const taskStartTime = taskStartTimeInput.value;
    const taskEndTime = taskEndTimeInput.value;
    const taskFrequency = DEFAULT_TASK_FREQUENCY; // 使用默认值
    
    // 验证输入
    if (!name) {
        alert('请输入您的名称！');
        playerNameInput.focus();
        return;
    }
    
    if (name.length > 20) {
        alert('名称不能超过20个字符！');
        playerNameInput.focus();
        return;
    }
    
    if (cycleDays < 1 || cycleDays > 30) {
        alert('身份选择周期必须在1-30天之间！');
        initCycleDaysInput.focus();
        return;
    }
    
    if (!taskStartTime || !taskEndTime) {
        alert('请设置任务发放周期时间！');
        return;
    }
    
    // 验证时间范围
    if (taskStartTime >= taskEndTime) {
        alert('结束时间必须晚于开始时间！');
        return;
    }
    
    // 保存所有设置
    playerName = name;
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerName);
    localStorage.setItem(STORAGE_KEYS.CYCLE_DAYS, cycleDays.toString());
    localStorage.setItem(STORAGE_KEYS.TASK_START_TIME, taskStartTime);
    localStorage.setItem(STORAGE_KEYS.TASK_END_TIME, taskEndTime);
    localStorage.setItem(STORAGE_KEYS.TASK_FREQUENCY, taskFrequency.toString());
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
    
    // 记录任务周期开始日期（使用身份选择周期作为任务周期）
    const cycleStartDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.TASK_CYCLE_START_DATE, cycleStartDate);
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_CALCULATED, 'false');
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS_THIS_CYCLE, JSON.stringify([]));
    
    // 启动任务定时器
    startTaskTimer(taskStartTime, taskEndTime, taskFrequency);
    
    // 切换到主界面
    switchToMainScreen();
}

// 切换到主界面
function switchToMainScreen() {
    // 显示玩家名称
    displayPlayerName.textContent = playerName;
    
    // 切换界面
    initScreen.classList.remove('active');
    
    // 检查是否需要显示身份选择窗口
    if (shouldShowRoleSelect()) {
        showRoleSelectModal();
    } else {
        // 加载已保存的身份
        loadPlayerRole();
        mainScreen.classList.add('active');
    }
}

// 检查是否应该显示身份选择窗口
function shouldShowRoleSelect() {
    const lastSelectTime = localStorage.getItem(STORAGE_KEYS.LAST_ROLE_SELECT_TIME);
    const cycleDays = parseInt(localStorage.getItem(STORAGE_KEYS.CYCLE_DAYS)) || DEFAULT_CYCLE_DAYS;
    
    if (!lastSelectTime) {
        return true; // 从未选择过，显示
    }
    
    const lastTime = new Date(lastSelectTime).getTime();
    const now = new Date().getTime();
    const daysPassed = (now - lastTime) / (1000 * 60 * 60 * 24);
    
    return daysPassed >= cycleDays;
}

// 显示身份选择窗口
function showRoleSelectModal() {
    roleSelectModal.classList.add('active');
    
    // 重置卡片选中状态
    roleCards.forEach(card => card.classList.remove('selected'));
    
    // 为每个卡片添加点击事件
    roleCards.forEach(card => {
        card.addEventListener('click', handleRoleSelect);
    });
}

// 处理身份选择
function handleRoleSelect(e) {
    const card = e.currentTarget;
    const role = card.getAttribute('data-role');
    
    // 移除所有选中状态
    roleCards.forEach(c => c.classList.remove('selected'));
    
    // 添加选中状态
    card.classList.add('selected');
    
    // 如果是随机身份，随机选择一个
    if (role === '?') {
        const roles = ['神', '狼', '人'];
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        playerRole = randomRole;
    } else {
        playerRole = role;
    }
    
    // 保存选择
    saveRoleSelection();
    
    // 延迟关闭窗口，显示选中效果
    setTimeout(() => {
        closeRoleSelectModal();
        displayPlayerRole.textContent = playerRole;
        mainScreen.classList.add('active');
    }, 500);
}

// 保存身份选择
function saveRoleSelection() {
    localStorage.setItem(STORAGE_KEYS.LAST_ROLE_SELECT_TIME, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.PLAYER_ROLE, playerRole);
    
    // 初始化属性值（如果还没有初始化过）
    if (!localStorage.getItem(STORAGE_KEYS.PLAYER_ATTRIBUTES)) {
        initializeAttributes();
    }
}

// 初始化属性值
function initializeAttributes() {
    // 根据身份设置默认值
    if (playerRole === '狼') {
        playerAttributes.wolf = 10;
        playerAttributes.god = 0;
        playerAttributes.human = 0;
    } else if (playerRole === '神') {
        playerAttributes.wolf = 0;
        playerAttributes.god = 10;
        playerAttributes.human = 0;
    } else if (playerRole === '人') {
        playerAttributes.wolf = 0;
        playerAttributes.god = 0;
        playerAttributes.human = 10;
    }
    
    // 保存初始属性值（用于洗点策略型成就判断）
    const initialAttrs = { ...playerAttributes };
    localStorage.setItem(STORAGE_KEYS.INITIAL_ATTRIBUTES, JSON.stringify(initialAttrs));
    
    saveAttributes();
}

// 保存属性
function saveAttributes() {
    localStorage.setItem(STORAGE_KEYS.PLAYER_ATTRIBUTES, JSON.stringify(playerAttributes));
}

// 加载属性
function loadAttributes() {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_ATTRIBUTES);
    if (saved) {
        playerAttributes = JSON.parse(saved);
    } else {
        // 如果没有保存的属性，根据当前身份初始化
        if (playerRole) {
            initializeAttributes();
        }
    }
}

// 关闭身份选择窗口
function closeRoleSelectModal() {
    roleSelectModal.classList.remove('active');
    roleCards.forEach(card => {
        card.removeEventListener('click', handleRoleSelect);
    });
}

// 加载玩家身份
function loadPlayerRole() {
    const savedRole = localStorage.getItem(STORAGE_KEYS.PLAYER_ROLE);
    if (savedRole) {
        playerRole = savedRole;
        displayPlayerRole.textContent = playerRole;
        // 加载属性
        loadAttributes();
    } else {
        displayPlayerRole.textContent = '未选择';
    }
}

// 加载玩家名称
function loadPlayerName() {
    const savedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    if (savedName) {
        playerName = savedName;
        displayPlayerName.textContent = playerName;
        return true;
    }
    return false;
}

// 检查是否已初始化
function isInitialized() {
    return localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED) === 'true';
}

// 加载初始化设置
function loadInitSettings() {
    const cycleDays = localStorage.getItem(STORAGE_KEYS.CYCLE_DAYS);
    const taskStartTime = localStorage.getItem(STORAGE_KEYS.TASK_START_TIME);
    const taskEndTime = localStorage.getItem(STORAGE_KEYS.TASK_END_TIME);
    
    if (cycleDays) initCycleDaysInput.value = cycleDays;
    if (taskStartTime) taskStartTimeInput.value = taskStartTime;
    if (taskEndTime) taskEndTimeInput.value = taskEndTime;
}

// 启动任务定时器
function startTaskTimer(startTime, endTime, frequency) {
    // 清除现有定时器
    if (taskTimer) {
        clearInterval(taskTimer);
        taskTimer = null;
    }
    
    // 检查当前时间是否已经到达或超过结束时间
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // 如果已经到达或超过结束时间，清除所有未接受的任务
    if (currentTimeStr >= endTime) {
        clearPendingTasks();
        // 检查是否到达任务周期的最后一天结束时间
        if (shouldCalculateAchievements()) {
            calculateAndShowAchievements();
        }
    }
    
    // 检查是否有保存的下次任务时间，且已经过了
    const savedNextTaskTime = localStorage.getItem(STORAGE_KEYS.NEXT_TASK_TIME);
    if (savedNextTaskTime) {
        const savedTime = new Date(savedNextTaskTime);
        if (now >= savedTime) {
            // 如果已经过了保存的时间，检查是否在周期内，如果是则发布任务
            if (currentTimeStr >= startTime && currentTimeStr < endTime) {
                publishTask();
            }
        }
    }
    
    // 计算下次任务发布时间
    const nextTaskTime = calculateNextTaskTime(startTime, endTime, frequency);
    
    // 保存下次任务时间
    if (nextTaskTime) {
        localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTaskTime.toISOString());
        
        // 计算到下次任务的延迟时间（毫秒）
        const now = new Date();
        const delay = nextTaskTime.getTime() - now.getTime();
        
        if (delay > 0) {
            // 设置首次任务定时器
            setTimeout(() => {
                const currentTime = new Date();
                const currentHour = currentTime.getHours();
                const currentMinute = currentTime.getMinutes();
                const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                
                // 检查是否在任务发放周期内
                if (currentTimeStr >= startTime && currentTimeStr < endTime) {
                    publishTask();
                    // 计算并保存下次任务时间
                    const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                    if (nextTime) {
                        localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                    }
                }
                
                // 启动周期性定时器
                taskTimer = setInterval(() => {
                    const currentTime = new Date();
                    const currentHour = currentTime.getHours();
                    const currentMinute = currentTime.getMinutes();
                    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                    
                    // 检查是否到达结束时间
                    if (currentTimeStr >= endTime) {
                        // 到达结束时间，清除所有未接受的任务
                        clearPendingTasks();
                        
                        // 检查是否到达任务周期的最后一天结束时间
                        if (shouldCalculateAchievements()) {
                            calculateAndShowAchievements();
                        }
                        
                        // 重新计算下次任务时间（明天）
                        const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                        if (nextTime) {
                            localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                            // 清除当前定时器，重新设置
                            clearInterval(taskTimer);
                            const newDelay = nextTime.getTime() - new Date().getTime();
                            if (newDelay > 0) {
                                setTimeout(() => {
                                    startTaskTimer(startTime, endTime, frequency);
                                }, newDelay);
                            }
                        }
                    } else if (currentTimeStr >= startTime && currentTimeStr < endTime) {
                        // 检查是否在任务发放周期内
                        publishTask();
                        // 更新下次任务时间
                        const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                        if (nextTime) {
                            localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                        }
                    } else {
                        // 如果不在周期内，重新计算下次任务时间（可能是明天）
                        const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                        if (nextTime) {
                            localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                            // 清除当前定时器，重新设置
                            clearInterval(taskTimer);
                            const newDelay = nextTime.getTime() - new Date().getTime();
                            if (newDelay > 0) {
                                setTimeout(() => {
                                    startTaskTimer(startTime, endTime, frequency);
                                }, newDelay);
                            }
                        }
                    }
                }, frequency * 60 * 60 * 1000); // 按频率设置间隔
            }, delay);
        } else {
            // 如果已经过了计算的时间，立即检查并发布（如果在周期内）
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();
            const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            
            if (currentTimeStr >= startTime && currentTimeStr < endTime) {
                publishTask();
                // 计算并保存下次任务时间
                const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                if (nextTime) {
                    localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                }
            }
            
            // 启动周期性定时器
            taskTimer = setInterval(() => {
                const currentTime = new Date();
                const currentHour = currentTime.getHours();
                const currentMinute = currentTime.getMinutes();
                const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                
                // 检查是否到达结束时间
                if (currentTimeStr >= endTime) {
                    // 到达结束时间，清除所有未接受的任务
                    clearPendingTasks();
                    // 重新计算下次任务时间（明天）
                    const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                    if (nextTime) {
                        localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                        // 清除当前定时器，重新设置
                        clearInterval(taskTimer);
                        const newDelay = nextTime.getTime() - new Date().getTime();
                        if (newDelay > 0) {
                            setTimeout(() => {
                                startTaskTimer(startTime, endTime, frequency);
                            }, newDelay);
                        }
                    }
                } else if (currentTimeStr >= startTime && currentTimeStr < endTime) {
                    // 检查是否在任务发放周期内
                    publishTask();
                    // 更新下次任务时间
                    const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                    if (nextTime) {
                        localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                    }
                } else {
                    // 如果不在周期内，重新计算下次任务时间
                    const nextTime = calculateNextTaskTime(startTime, endTime, frequency);
                    if (nextTime) {
                        localStorage.setItem(STORAGE_KEYS.NEXT_TASK_TIME, nextTime.toISOString());
                    }
                }
            }, frequency * 60 * 60 * 1000);
        }
    }
}

// 计算下次任务发布时间
function calculateNextTaskTime(startTime, endTime, frequency) {
    const now = new Date();
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // 今天的开始时间
    const todayStart = new Date(now);
    todayStart.setHours(startHour, startMinute, 0, 0);
    
    // 今天的结束时间
    const todayEnd = new Date(now);
    todayEnd.setHours(endHour, endMinute, 0, 0);
    
    // 如果当前时间在周期内，计算下次发布时间
    if (now >= todayStart && now < todayEnd) {
        // 计算从开始时间到现在经过了多少个频率周期
        const elapsed = now.getTime() - todayStart.getTime();
        const frequencyMs = frequency * 60 * 60 * 1000;
        const cyclesPassed = Math.floor(elapsed / frequencyMs);
        const nextTime = new Date(todayStart.getTime() + (cyclesPassed + 1) * frequencyMs);
        
        // 如果下次时间在结束时间之前，返回
        if (nextTime < todayEnd) {
            return nextTime;
        }
    } else if (now < todayStart) {
        // 如果还没到今天的开始时间，返回今天的开始时间
        return todayStart;
    }
    
    // 如果今天已经过了，返回明天的开始时间
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    return tomorrowStart;
}

// 从任务数据中随机派发任务
function publishTask() {
    const taskData = getCachedTaskData();
    if (!taskData || !Array.isArray(taskData.tasks) || taskData.tasks.length === 0) {
        console.warn('本地任务数据不存在或为空，使用占位任务');
        // 回退到占位任务（单个）
        const fallbackTask = {
            id: taskIdCounter++,
            title: '任务 #' + taskIdCounter,
            content: '任务内容待定，这是第 ' + taskIdCounter + ' 个任务。',
            status: 'pending',
            publishTime: new Date().toISOString(),
            goal: '任务目标待定',
            story: '任务故事待定',
            type: playerRole || '人',
            scores: {
                wolf: 0,
                god: 0,
                human: 0
            }
        };
        tasks.push(fallbackTask);
        saveTasks();
        renderTasks();
        return;
    }

    const allTemplates = taskData.tasks;
    const desiredCount = 3;

    // 根据当前身份确定类型映射（这里直接使用同名类型：'神'、'狼'、'人'）
    const currentType = playerRole || '人';

    // 按类型分组模板索引
    const typeToIndices = {
        '狼': [],
        '神': [],
        '人': []
    };
    allTemplates.forEach((tpl, index) => {
        if (typeToIndices[tpl.type]) {
            typeToIndices[tpl.type].push(index);
        }
    });

    // 工具函数：从索引数组中随机取出一个索引（不移除）
    function getRandomIndexFrom(arr) {
        if (!arr || arr.length === 0) return null;
        const r = Math.floor(Math.random() * arr.length);
        return arr[r];
    }

    const selectedTemplateIndices = new Set();
    const resultTypesCount = { '狼': 0, '神': 0, '人': 0 };

    // 1. 优先选择与玩家身份相同的任务，最多 2 个
    if (typeToIndices[currentType] && typeToIndices[currentType].length > 0) {
        const sameTypeIndices = [...typeToIndices[currentType]];
        const sameTypeMax = Math.min(2, sameTypeIndices.length, desiredCount);
        while (resultTypesCount[currentType] < sameTypeMax && selectedTemplateIndices.size < desiredCount) {
            const idx = getRandomIndexFrom(sameTypeIndices);
            if (idx !== null && !selectedTemplateIndices.has(idx)) {
                selectedTemplateIndices.add(idx);
                resultTypesCount[currentType]++;
            }
        }
    }

    // 2. 选择非同身份的任务，要求：
    //   - 总数补足到 3 个
    //   - 每种非同身份类型最多 1 个
    const otherTypes = ['狼', '神', '人'].filter(t => t !== currentType);
    while (selectedTemplateIndices.size < desiredCount) {
        // 按随机顺序尝试两种其他类型
        const shuffledOtherTypes = [...otherTypes].sort(() => Math.random() - 0.5);
        let picked = false;

        for (const t of shuffledOtherTypes) {
            if (resultTypesCount[t] >= 1) continue; // 每种非同身份任务最多 1 个
            const pool = typeToIndices[t];
            if (!pool || pool.length === 0) continue;
            const idx = getRandomIndexFrom(pool);
            if (idx !== null && !selectedTemplateIndices.has(idx)) {
                selectedTemplateIndices.add(idx);
                resultTypesCount[t]++;
                picked = true;
                break;
            }
        }

        // 如果没能再选出任务（例如某类型池为空），跳出避免死循环
        if (!picked) break;
    }

    // 防御性：如果仍不足 3 个，尝试从所有模板中补齐（不再严格约束类型）
    const allIndices = allTemplates.map((_, i) => i);
    while (selectedTemplateIndices.size < desiredCount && selectedTemplateIndices.size < allIndices.length) {
        const idx = getRandomIndexFrom(allIndices);
        if (!selectedTemplateIndices.has(idx)) {
            selectedTemplateIndices.add(idx);
        }
    }

    // 根据选中的模板创建实际任务对象
    const nowISO = new Date().toISOString();
    selectedTemplateIndices.forEach(idx => {
        const tpl = allTemplates[idx];
        const task = {
            id: taskIdCounter++,
            templateId: tpl.id, // 记录来源模板编号
            title: tpl.title,
            // 列表中展示任务目标
            content: tpl.goal || tpl.title,
            status: 'pending',
            publishTime: nowISO,
            goal: tpl.goal || '任务目标待定',
            story: tpl.story || '任务故事待定',
            type: tpl.type || currentType,
            scores: tpl.scores || {
                wolf: 0,
                god: 0,
                human: 0
            }
        };
        tasks.push(task);
    });

    saveTasks();
    renderTasks();
}

// 保存任务列表
function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// 加载任务列表
function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        // 更新任务ID计数器
        if (tasks.length > 0) {
            taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
        }
        
        // 清除未接受且非当日的任务
        clearNonTodayPendingTasks();
        
        renderTasks();
    }
}

// 判断任务是否是当日的
function isTaskToday(task) {
    const taskDate = new Date(task.publishTime);
    const today = new Date();
    
    return taskDate.getFullYear() === today.getFullYear() &&
           taskDate.getMonth() === today.getMonth() &&
           taskDate.getDate() === today.getDate();
}

// 清除未接受且非当日的任务
function clearNonTodayPendingTasks() {
    const beforeCount = tasks.length;
    tasks = tasks.filter(task => {
        // 保留已接受的任务，或者保留当日的未接受任务
        if (task.status === 'accepted') {
            return true;
        }
        if (task.status === 'pending') {
            return isTaskToday(task);
        }
        // 其他状态的任务也保留（已完成、已拒绝、已放弃等）
        return true;
    });
    
    if (tasks.length !== beforeCount) {
        saveTasks();
    }
}

// 清除所有未接受的任务
function clearPendingTasks() {
    const beforeCount = tasks.length;
    tasks = tasks.filter(task => task.status !== 'pending');
    
    if (tasks.length !== beforeCount) {
        saveTasks();
        renderTasks();
    }
}

// 渲染任务列表
function renderTasks() {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyTasks.style.display = 'block';
        return;
    }
    
    emptyTasks.style.display = 'none';
    
    // 显示待处理、已接受和已完成的任务（不显示已拒绝、已放弃的任务）
    const visibleTasks = tasks.filter(t =>
        t.status === 'pending' ||
        t.status === 'accepted' ||
        t.status === 'completed'
    );
    
    if (visibleTasks.length === 0) {
        emptyTasks.textContent = '暂无任务';
        emptyTasks.style.display = 'block';
        return;
    }
    
    visibleTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksList.appendChild(taskCard);
    });
}

// 创建任务卡片
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    // 根据任务状态添加不同的样式类
    if (task.status === 'accepted') {
        card.classList.add('task-accepted');
    } else if (task.status === 'completed') {
        card.classList.add('task-completed');
    }
    
    card.dataset.taskId = task.id;
    
    const publishTime = new Date(task.publishTime);
    const timeStr = publishTime.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // 根据任务状态显示不同的按钮
    // 已完成的任务不显示任何按钮
    let actionsHTML = '';
    if (task.status === 'pending') {
        actionsHTML = `
            <button class="btn-accept" data-task-id="${task.id}">接受</button>
            <button class="btn-reject" data-task-id="${task.id}">拒绝</button>
        `;
    } else if (task.status === 'accepted') {
        actionsHTML = `
            <button class="btn-complete" data-task-id="${task.id}">完成</button>
            <button class="btn-abandon" data-task-id="${task.id}">放弃</button>
        `;
    }
    // task.status === 'completed' 时，actionsHTML 为空字符串，不显示按钮
    
    const typeLabel = task.type ? ` [${task.type}]` : '';
    let statusBadgeHtml = '';
    if (task.status === 'accepted') {
        statusBadgeHtml = '<span class="status-badge status-accepted">已接受</span>';
    } else if (task.status === 'completed') {
        statusBadgeHtml = '<span class="status-badge status-completed">已完成</span>';
    }

    card.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}${typeLabel}</h3>
            <span class="task-time">${timeStr}</span>
        </div>
        <div class="task-content">${task.goal || task.content || ''}</div>
        <div class="task-status">
            ${statusBadgeHtml}
        </div>
        <div class="task-actions">
            ${actionsHTML}
        </div>
    `;
    
    // 添加卡片点击事件（显示详情）
    card.addEventListener('click', (e) => {
        // 如果点击的是按钮，不触发详情弹窗
        if (e.target.classList.contains('btn-accept') || 
            e.target.classList.contains('btn-reject') ||
            e.target.classList.contains('btn-complete') ||
            e.target.classList.contains('btn-abandon')) {
            return;
        }
        showTaskDetail(task);
    });
    
    // 添加按钮事件
    if (task.status === 'pending') {
        const acceptBtn = card.querySelector('.btn-accept');
        const rejectBtn = card.querySelector('.btn-reject');
        acceptBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleTaskAction(task.id, 'accepted');
        });
        rejectBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleTaskAction(task.id, 'rejected');
        });
    } else if (task.status === 'accepted') {
        const completeBtn = card.querySelector('.btn-complete');
        const abandonBtn = card.querySelector('.btn-abandon');
        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleTaskAction(task.id, 'completed');
        });
        abandonBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleTaskAction(task.id, 'abandoned');
        });
    }
    
    return card;
}

// 处理任务操作（接受/拒绝）
function handleTaskAction(taskId, action) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = action;
        
        // 如果任务被完成，结算任务分数到玩家属性
        if (action === 'completed') {
            applyTaskScoresToAttributes(task);
            // 记录完成的任务
            recordCompletedTask(task);
        }
        
        saveTasks();
        renderTasks();
    }
}

// 根据任务分数更新玩家属性（完成任务时调用）
function applyTaskScoresToAttributes(task) {
    if (!task || !task.scores) return;
    
    // 调试日志：任务基础信息
    console.groupCollapsed &&
    console.groupCollapsed(
        '[属性结算] 任务完成',
        `ID=${task.id}`,
        `标题=${task.title}`,
        `类型=${task.type}`,
        `玩家身份=${playerRole}`
    );
    console.log('[属性结算] 原始任务分数:', JSON.stringify(task.scores));
    
    // 确保当前属性是最新的
    loadAttributes();
    
    const scores = task.scores || { wolf: 0, god: 0, human: 0 };
    const isSameType = task.type && task.type === playerRole;
    
    // 对三个维度分别结算
    ['wolf', 'god', 'human'].forEach(key => {
        let original = scores[key] || 0;
        if (original === 0) {
            console.log(`[属性结算] 维度=${key} 原始分数为 0，跳过`);
            return; // 没有分数就跳过
        }
        
        let delta;
        let factor = 1;
        
        if (isSameType) {
            // 1. 本身份任务：不加权，直接按原始分数累加
            delta = original;
        } else {
            // 2. 非本身份任务：需要加权
            if (original > 0) {
                // 加分项：乘以 [0.5, 0.8] 的随机数，结果向下取整，最少 1 分
                factor = 0.5 + Math.random() * 0.3; // [0.5, 0.8]
                delta = Math.floor(original * factor);
                if (delta < 1) delta = 1;
            } else {
                // 减分项：乘以 [1.2, 1.5] 的随机数，结果向上取整（负数向上取整会减得更少）
                factor = 1.2 + Math.random() * 0.3; // [1.2, 1.5]
                delta = Math.ceil(original * factor);
            }
        }
        
        // 累加到对应属性，并限制在 [0, 100] 区间
        const current = playerAttributes[key] || 0;
        let next = current + delta;
        if (next > 100) next = 100;
        if (next < 0) next = 0;
        playerAttributes[key] = next;
        
        // 调试日志：单维度结算结果
        console.log(
            `[属性结算] 维度=${key}`,
            `本身份任务=${isSameType}`,
            `原始=${original}`,
            `系数=${factor.toFixed ? factor.toFixed(3) : factor}`,
            `增量(delta)=${delta}`,
            `原属性=${current} -> 新属性=${next}`
        );
    });
    
    console.log('[属性结算] 结算后属性值:', JSON.stringify(playerAttributes));
    console.groupEnd && console.groupEnd();
    
    // 保存并刷新雷达图
    saveAttributes();
    updateRadarChart();
}

// 记录完成的任务
function recordCompletedTask(task) {
    const completedTasks = getCompletedTasksThisCycle();
    // 只记录任务的基本信息
    completedTasks.push({
        id: task.id,
        title: task.title || task.goal || '未知任务',
        type: task.type || '未知',
        completedTime: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS_THIS_CYCLE, JSON.stringify(completedTasks));
}

// 获取本周期完成的任务
function getCompletedTasksThisCycle() {
    const cached = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS_THIS_CYCLE);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('解析完成的任务数据失败:', error);
            return [];
        }
    }
    return [];
}

// 检查是否到达任务周期的最后一天结束时间
function shouldCalculateAchievements() {
    const cycleStartDateStr = localStorage.getItem(STORAGE_KEYS.TASK_CYCLE_START_DATE);
    const achievementCalculated = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_CALCULATED);
    
    // 如果已经计算过，不再计算
    if (achievementCalculated === 'true') {
        return false;
    }
    
    // 如果没有周期开始日期，不计算
    if (!cycleStartDateStr) {
        return false;
    }
    
    const cycleStartDate = new Date(cycleStartDateStr);
    const cycleDays = parseInt(localStorage.getItem(STORAGE_KEYS.CYCLE_DAYS)) || 7;
    const taskEndTime = localStorage.getItem(STORAGE_KEYS.TASK_END_TIME) || DEFAULT_TASK_END_TIME;
    
    // 计算最后一天的结束时间
    const lastDayEnd = new Date(cycleStartDate);
    lastDayEnd.setDate(lastDayEnd.getDate() + cycleDays - 1);
    const [endHour, endMinute] = taskEndTime.split(':').map(Number);
    lastDayEnd.setHours(endHour, endMinute, 0, 0);
    
    // 检查当前时间是否已经到达或超过最后一天的结束时间
    const now = new Date();
    return now >= lastDayEnd;
}

// 计算并显示成就结果
function calculateAndShowAchievements() {
    // 加载玩家属性
    loadAttributes();
    
    // 计算成就
    const achievements = calculateAchievementsWithValues(
        playerAttributes.god || 0,
        playerAttributes.wolf || 0,
        playerAttributes.human || 0
    );
    
    // 获取成就数据
    const achievementData = getCachedAchievementData();
    
    // 获取完成的任务
    const completedTasks = getCompletedTasksThisCycle();
    
    // 显示成就结果
    if (achievements && achievements.length > 0) {
        // 有成就，显示成就列表
        achievementResultContent.innerHTML = achievements.map(achievement => {
            let description = '';
            if (achievement.id && achievementData && Array.isArray(achievementData)) {
                const achievementIndex = achievement.id - 1;
                if (achievementIndex >= 0 && achievementIndex < achievementData.length) {
                    description = achievementData[achievementIndex].描述 || '';
                }
            }
            
            return `
                <div class="achievement-result-item">
                    <div class="achievement-result-name">${achievement.title || '未知'} (编号: ${achievement.id || 'N/A'})</div>
                    ${description ? `<div class="achievement-result-description">${description}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // 解锁称号
        unlockTitle(achievements);
    } else {
        // 没有成就
        achievementResultContent.innerHTML = '<div class="achievement-result-empty">未完成成就</div>';
    }
    
    // 显示完成的任务
    if (completedTasks && completedTasks.length > 0) {
        completedTasksList.innerHTML = completedTasks.map(task => `
            <div class="completed-task-item">
                <span class="task-title">${task.title}</span>
                <span class="task-type">[${task.type}]</span>
            </div>
        `).join('');
    } else {
        completedTasksList.innerHTML = '<div class="completed-tasks-empty">本周期未完成任务</div>';
    }
    
    // 标记为已计算
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_CALCULATED, 'true');
    
    // 显示弹窗
    achievementResultModal.classList.add('active');
}

// 显示任务详情
function showTaskDetail(task) {
    // 设置任务标题
    document.getElementById('taskDetailTitle').textContent = task.title;
    
    // 设置任务目标（如果不存在则使用默认值）
    const goal = task.goal || '任务目标待定';
    document.getElementById('taskDetailGoal').textContent = goal;
    
    // 设置任务故事（如果不存在则使用默认值）
    const story = task.story || '任务故事待定';
    document.getElementById('taskDetailStory').textContent = story;
    
    // 设置任务分数（如果不存在则使用默认值）
    const scores = task.scores || { wolf: 0, god: 0, human: 0 };
    document.getElementById('scoreWolf').textContent = scores.wolf || 0;
    document.getElementById('scoreGod').textContent = scores.god || 0;
    document.getElementById('scoreHuman').textContent = scores.human || 0;
    
    // 显示弹窗
    taskDetailModal.classList.add('active');
}

// 关闭任务详情弹窗
closeTaskDetailBtn.addEventListener('click', () => {
    taskDetailModal.classList.remove('active');
});

// 点击模态框背景关闭
taskDetailModal.addEventListener('click', (e) => {
    if (e.target === taskDetailModal) {
        taskDetailModal.classList.remove('active');
    }
});

// 清除所有数据
function clearAllData() {
    // 清除定时器
    if (taskTimer) {
        clearInterval(taskTimer);
        taskTimer = null;
    }
    
    // 清除所有STORAGE_KEYS中的数据
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    
    // 重置变量
    playerName = '';
    playerRole = '';
    tasks = [];
    taskIdCounter = 0;
    playerAttributes = {
        wolf: 0,
        god: 0,
        human: 0
    };
    
    // 刷新页面，重新开始
    location.reload();
}

// 设置相关功能
settingsBtn.addEventListener('click', () => {
    // 加载当前周期设置
    const cycleDays = parseInt(localStorage.getItem(STORAGE_KEYS.CYCLE_DAYS)) || DEFAULT_CYCLE_DAYS;
    cycleDaysInput.value = cycleDays;
    settingsModal.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

saveSettingsBtn.addEventListener('click', () => {
    const cycleDays = parseInt(cycleDaysInput.value);
    if (cycleDays < 1 || cycleDays > 30) {
        alert('周期天数必须在1-30天之间！');
        return;
    }
    localStorage.setItem(STORAGE_KEYS.CYCLE_DAYS, cycleDays.toString());
    alert('设置已保存！');
    settingsModal.classList.remove('active');
});

resetCycleBtn.addEventListener('click', () => {
    if (confirm('确定要重置周期吗？这将立即显示身份选择窗口。')) {
        localStorage.removeItem(STORAGE_KEYS.LAST_ROLE_SELECT_TIME);
        settingsModal.classList.remove('active');
        mainScreen.classList.remove('active');
        showRoleSelectModal();
    }
});

clearDataBtn.addEventListener('click', () => {
    if (confirm('确定要清除所有数据吗？这将删除您的玩家名称、身份和所有设置，并重新开始游戏。此操作不可恢复！')) {
        clearAllData();
    }
});

// 调试功能：立即发放任务
debugTaskBtn.addEventListener('click', () => {
    publishTask();
});

// 初始化雷达图
function initRadarChart() {
    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;
    
    // 检查 ECharts 是否已正确加载
    if (typeof echarts === 'undefined' || !echarts.init) {
        console.error('ECharts 库未正确加载，请确保 js/echarts.min.js 文件存在且完整');
        chartDom.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">ECharts 库未加载<br/>请下载 echarts.min.js 到 js/ 目录</div>';
        return;
    }
    
    try {
        radarChart = echarts.init(chartDom);
        updateRadarChart();
    } catch (error) {
        console.error('初始化雷达图失败:', error);
        chartDom.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">雷达图初始化失败<br/>请检查 ECharts 库是否正确加载</div>';
    }
}

// 更新雷达图
function updateRadarChart() {
    if (!radarChart) return;
    
    // 同步顶部数值显示（按 神 / 狼 / 人 顺序）
    const godEl = document.getElementById('attrGodValue');
    const wolfEl = document.getElementById('attrWolfValue');
    const humanEl = document.getElementById('attrHumanValue');
    const godVal = Math.round(playerAttributes.god || 0);
    const wolfVal = Math.round(playerAttributes.wolf || 0);
    const humanVal = Math.round(playerAttributes.human || 0);
    if (godEl && wolfEl && humanEl) {
        godEl.textContent = godVal;
        wolfEl.textContent = wolfVal;
        humanEl.textContent = humanVal;
    }

    // 根据当前属性动态计算各维度的最大值：max = maxAttr + 10，超过 100 则为 100
    const maxAttr = Math.max(godVal, wolfVal, humanVal);
    let dynamicMax = maxAttr + 10;
    if (dynamicMax <= 0) {
        // 如果三项都是 0，保持默认 100，保证图形正常显示
        dynamicMax = 100;
    } else if (dynamicMax > 100) {
        dynamicMax = 100;
    }
    
    const option = {
        radar: {
            indicator: [
                { name: '神性', max: dynamicMax, min: 0 },
                { name: '狼性', max: dynamicMax, min: 0 },
                { name: '人性', max: dynamicMax, min: 0 }
            ],
            shape: 'polygon',
            radius: '78%',
            center: ['50%', '50%'],
            startAngle: -90, // 从顶部开始，形成倒三角形
            splitNumber: 5,
            name: {
                textStyle: {
                    color: '#666',
                    fontSize: 14,
                    fontWeight: 600
                }
            },
            splitArea: {
                areaStyle: {
                    // 维度背景区域颜色更淡
                    color: [
                        'rgba(102, 126, 234, 0.06)',
                        'rgba(102, 126, 234, 0.03)'
                    ]
                }
            },
            splitLine: {
                lineStyle: {
                    // 维度分割线颜色更淡
                    color: 'rgba(102, 126, 234, 0.3)'
                }
            },
            axisLine: {
                lineStyle: {
                    // 轴线颜色更淡
                    color: 'rgba(102, 126, 234, 0.25)'
                }
            }
        },
        series: [{
            name: '属性值',
            type: 'radar',
            data: [{
                value: [
                    // 顺序需与 indicator 保持一致：神 / 狼 / 人
                    Math.round(playerAttributes.god),
                    Math.round(playerAttributes.wolf),
                    Math.round(playerAttributes.human)
                ],
                name: '当前属性',
                areaStyle: {
                    // 玩家区域颜色略浅
                    color: 'rgba(102, 126, 234, 0.25)'
                },
                lineStyle: {
                    // 玩家线条颜色更深、更突出
                    color: '#3b5bdb',
                    width: 3
                },
                itemStyle: {
                    color: '#3b5bdb'
                },
                label: {
                    // 玩家点位不再显示具体数值
                    show: false
                }
            }]
        }]
    };
    
    radarChart.setOption(option);
    
    // 响应式调整
    window.addEventListener('resize', () => {
        if (radarChart) {
            radarChart.resize();
        }
    });
}

// 属性按钮事件
attributesBtn.addEventListener('click', () => {
    loadAttributes();
    attributesModal.classList.add('active');
    // 延迟初始化图表，确保DOM已渲染
    setTimeout(() => {
        initRadarChart();
    }, 100);
});

closeAttributesBtn.addEventListener('click', () => {
    attributesModal.classList.remove('active');
});

// 成就调试按钮事件
achievementDebugBtn.addEventListener('click', () => {
    // 重置所有输入框为默认值0
    if (debugGodInput) debugGodInput.value = '0';
    if (debugWolfInput) debugWolfInput.value = '0';
    if (debugHumanInput) debugHumanInput.value = '0';
    achievementDebugModal.classList.add('active');
});

// 点击成就调试模态框背景关闭
achievementDebugModal.addEventListener('click', (e) => {
    if (e.target === achievementDebugModal) {
        achievementDebugModal.classList.remove('active');
    }
});

// 成就调试计算按钮事件
debugCalculateBtn.addEventListener('click', () => {
    calculateDebugAchievements();
});

// 成就调试计算函数
function calculateDebugAchievements() {
    if (!debugGodInput || !debugWolfInput || !debugHumanInput || !debugResults) {
        return;
    }
    
    const god = parseInt(debugGodInput.value) || 0;
    const wolf = parseInt(debugWolfInput.value) || 0;
    const human = parseInt(debugHumanInput.value) || 0;
    
    // 调用成就计算函数
    const achievements = calculateAchievementsWithValues(god, wolf, human);
    
    // 保存当前计算的成就数组，供确认按钮使用
    currentDebugAchievements = achievements || [];
    
    // 获取成就数据
    const achievementData = getCachedAchievementData();
    
    // 显示计算结果到结果弹窗
    if (achievements && achievements.length > 0) {
        debugResults.innerHTML = achievements.map(achievement => {
            // 根据成就编号获取描述（编号 - 1 对应数组索引）
            let description = '';
            if (achievement.id && achievementData && Array.isArray(achievementData)) {
                const achievementIndex = achievement.id - 1;
                if (achievementIndex >= 0 && achievementIndex < achievementData.length) {
                    description = achievementData[achievementIndex].描述 || '';
                }
            }
            
            return `
                <div class="debug-result-item">
                    <div class="debug-result-name">${achievement.title || '未知'} (编号: ${achievement.id || 'N/A'})</div>
                    ${description ? `<div class="debug-result-description">${description}</div>` : ''}
                </div>
            `;
        }).join('');
    } else {
        debugResults.innerHTML = '<div class="debug-results-empty">未达成任何成就</div>';
    }
    
    // 关闭输入弹窗，打开结果弹窗
    achievementDebugModal.classList.remove('active');
    achievementDebugResultModal.classList.add('active');
}

// 确认成就调试结果，解锁称号
confirmAchievementDebugBtn.addEventListener('click', () => {
    if (currentDebugAchievements && currentDebugAchievements.length > 0) {
        // 调用unlockTitle函数解锁称号
        unlockTitle(currentDebugAchievements);
        alert('成就已解锁！');
    } else {
        alert('没有可解锁的成就');
    }
});

// 关闭成就调试结果弹窗，返回到输入弹窗
closeAchievementDebugResultBtn.addEventListener('click', () => {
    achievementDebugResultModal.classList.remove('active');
    // 返回到成就调试输入弹窗
    achievementDebugModal.classList.add('active');
});

// 点击成就调试结果模态框背景关闭，返回到输入弹窗
achievementDebugResultModal.addEventListener('click', (e) => {
    if (e.target === achievementDebugResultModal) {
        achievementDebugResultModal.classList.remove('active');
        // 返回到成就调试输入弹窗
        achievementDebugModal.classList.add('active');
    }
});

// 根据输入的属性值计算成就
function calculateAchievementsWithValues(god, wolf, human) {
    const results = [];
    
    // 计算辅助值
    const maxVal = Math.max(god, wolf, human);
    const minVal = Math.min(god, wolf, human);
    const diff = maxVal - minVal; // 三维差值
    const total = god + wolf + human; // 总分
    
    // 判断三个维度差值
    const threeDimDiff1 = diff === 1;
    const threeDimDiff2_3 = diff >= 2 && diff <= 3;
    
    // 判断比例（约6:4，即比值在1.3到1.7之间）
    const isRatio64 = (val1, val2) => {
        if (val2 === 0 || val1 === 0) return false;
        const ratio = val1 / val2;
        return ratio >= 1.3 && ratio <= 1.7;
    };
    
    // 判断是否都是奇数
    const allOdd = (god % 2 === 1) && (wolf % 2 === 1) && (human % 2 === 1);
    
    // 判断最高维（如果maxVal为0，则maxDim为空值）
    const maxDim = maxVal === 0 ? null : (maxVal === god ? 'god' : (maxVal === wolf ? 'wolf' : 'human'));
    
    // 成就规则判断（按照编号顺序）
    
    // 1-3: 圣徒
    if (god >= 80 && god <= 89 && 0 < wolf <= 10 && 0 < human && human <= 10) {
        results.push({ title: '圣徒', id: 1 });
    }
    if (god >= 90 && god <= 95 && 0 < wolf <= 10 && 0 < human && human <= 10) {
        results.push({ title: '圣徒', id: 2 });
    }
    if (god >= 96 && god <= 100 && 0 < wolf <= 10 && 0 < human && human <= 10) {
        results.push({ title: '圣徒', id: 3 });
    }
    
    // 4-6: 血月狼王
    if (wolf >= 80 && wolf <= 89 && 0 < god <= 10 && 0 < human && human <= 10) {
        results.push({ title: '血月狼王', id: 4 });
    }
    if (wolf >= 90 && wolf <= 95 && 0 < god <= 10 && 0 < human && human <= 10) {
        results.push({ title: '血月狼王', id: 5 });
    }
    if (wolf >= 96 && wolf <= 100 && 0 < god <= 10 && 0 < human && human <= 10) {
        results.push({ title: '血月狼王', id: 6 });
    }
    
    // 7-9: 职场素人
    if (human >= 80 && human <= 89 && 0 < god <= 10 && 0 < wolf && wolf <= 10) {
        results.push({ title: '职场素人', id: 7 });
    }
    if (human >= 90 && human <= 95 && 0 < god <= 10 && 0 < wolf && wolf <= 10) {
        results.push({ title: '职场素人', id: 8 });
    }
    if (human >= 96 && human <= 100 && 0 < god <= 10 && 0 < wolf && wolf <= 10) {
        results.push({ title: '职场素人', id: 9 });
    }
    
    // 10-11: 混沌元首
    if (threeDimDiff1) {
        results.push({ title: '混沌元首', id: 10 });
    }
    if (threeDimDiff2_3) {
        results.push({ title: '混沌元首', id: 11 });
    }
    
    // 12-14: 伪善家
    if (isRatio64(god, wolf) && 0 < human && human <= 20) {
        results.push({ title: '伪善家', id: 12 });
    }
    if (isRatio64(wolf, god) && 0 < human && human <= 20) {
        results.push({ title: '伪善家', id: 13 });
    }
    if (Math.abs(god - wolf) <= 5 && 0 < human && human <= 20) {
        results.push({ title: '伪善家', id: 14 });
    }
    
    // 15-17: 痛苦的老好人
    if (isRatio64(god, human) && 0 < wolf && wolf <= 20) {
        results.push({ title: '痛苦的老好人', id: 15 });
    }
    if (isRatio64(human, god) && 0 < wolf && wolf <= 20) {
        results.push({ title: '痛苦的老好人', id: 16 });
    }
    if (Math.abs(god - human) <= 5 && 0 < wolf && wolf <= 20) {
        results.push({ title: '痛苦的老好人', id: 17 });
    }
    
    // 18-20: 隐匿的狼人
    if (isRatio64(wolf, human) && 0 < god && god <= 20) {
        results.push({ title: '隐匿的狼人', id: 18 });
    }
    if (isRatio64(human, wolf) && 0 < god && god <= 20) {
        results.push({ title: '隐匿的狼人', id: 19 });
    }
    if (Math.abs(wolf - human) <= 5 && 0 < god && god <= 20) {
        results.push({ title: '隐匿的狼人', id: 20 });
    }
    
    // 21-23: 精致的利己主义者
    if (wolf > human && 0 < god && god <= 20) {
        results.push({ title: '精致的利己主义者', id: 21 });
    }
    if (human > wolf && 0 < god && god <= 20) {
        results.push({ title: '精致的利己主义者', id: 22 });
    }
    if (Math.abs(wolf - human) <= 5 && 0 < god && god <= 20) {
        results.push({ title: '精致的利己主义者', id: 23 });
    }
    
    // 24: 殉道者
    if (god >= 50 && human >= 40 && 0 < wolf && wolf <= 20) {
        results.push({ title: '殉道者', id: 24 });
    }
    
    // 25: 功利主义伙伴
    if (god >= 40 && wolf >= 40 && 0 < human && human <= 20) {
        results.push({ title: '功利主义伙伴', id: 25 });
    }
    
    // 26-28: 职场变色龙
    if (maxDim === 'god' && diff <= 15) {
        results.push({ title: '职场变色龙', id: 26 });
    }
    if (maxDim === 'wolf' && diff <= 15) {
        results.push({ title: '职场变色龙', id: 27 });
    }
    if (maxDim === 'human' && diff <= 15) {
        results.push({ title: '职场变色龙', id: 28 });
    }
    
    // 29-30: 三角弈者
    if (diff <= 10 && god > 20 && wolf > 20 && human > 20) {
        results.push({ title: '三角弈者', id: 29 });
    }
    const maxMinDiff = Math.max(
        Math.abs(god - wolf),
        Math.abs(god - human),
        Math.abs(wolf - human)
    );
    if (maxMinDiff >= 5 && maxMinDiff <= 10 && god > 20 && wolf > 20 && human > 20) {
        results.push({ title: '三角弈者', id: 30 });
    }
    
    // 31-32: 迷雾代理人
    if (total < 60 && god > 25 && wolf > 25 && human > 25 && diff <= 20) {
        results.push({ title: '迷雾代理人', id: 31 });
    }
    if (total >= 80 && god > 25 && wolf > 25 && human > 25 && diff <= 20) {
        results.push({ title: '迷雾代理人', id: 32 });
    }
    
    // 33: 系统漏洞
    if (allOdd) {
        results.push({ title: '系统漏洞', id: 33 });
    }
    
    // 34: 无心之神
    if (god === 100 && wolf === 0 && human === 0) {
        results.push({ title: '无心之神', id: 34 });
    }
    
    // 35: 纯粹之恶
    if (wolf === 100 && god === 0 && human === 0) {
        results.push({ title: '纯粹之恶', id: 35 });
    }
    
    // 36: 绝对打工人
    if (human === 100 && god === 0 && wolf === 0) {
        results.push({ title: '绝对打工人', id: 36 });
    }
    
    // 37: 归零者
    if (god === 0 && wolf === 0 && human === 0) {
        results.push({ title: '归零者', id: 37 });
    }
    
    // 38: 行为艺术者 (33/34/33类组合，理解为接近等分)
    const sorted = [god, wolf, human].sort((a, b) => a - b);
    if (sorted[0] >= 30 && sorted[0] <= 36 && 
        sorted[1] >= 30 && sorted[1] <= 36 && 
        sorted[2] >= 30 && sorted[2] <= 36 &&
        diff <= 5) {
        results.push({ title: '行为艺术者', id: 38 });
    }
    
    // 39: 纯白圣徒
    if (god >= 95 && 0 < wolf && wolf <= 3 && 0 < human && human <= 2) {
        results.push({ title: '纯白圣徒', id: 39 });
    }
    
    // 40: 绝对野心家
    if (wolf >= 95 && 0 < god && god <= 2 && 0 < human && human <= 3) {
        results.push({ title: '绝对野心家', id: 40 });
    }
    
    return results;
}

// 解锁称号函数
// 入参：成就数组，格式为 [{ title: '成就名称', id: 编号 }, ...]
function unlockTitle(achievements) {
    if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
        return;
    }
    
    // 获取已解锁称号对象
    const unlockedTitles = getUnlockedTitles();
    
    // 遍历成就数组
    achievements.forEach(achievement => {
        const titleName = achievement.title;
        const achievementId = achievement.id;
        
        if (!titleName || !achievementId) {
            return;
        }
        
        // 根据成就名称找到对应的称号
        if (!unlockedTitles[titleName]) {
            // 如果称号不存在，跳过（理论上应该已经初始化）
            console.warn(`称号 "${titleName}" 不存在于 unlockedTitles 中`);
            return;
        }
        
        const titleInfo = unlockedTitles[titleName];
        
        // 在 achievements 属性中找到对应的成就并将其赋值为 true
        const achievementKey = String(achievementId);
        if (titleInfo.achievements.hasOwnProperty(achievementKey)) {
            titleInfo.achievements[achievementKey] = true;
        } else {
            console.warn(`成就编号 ${achievementId} 不存在于称号 "${titleName}" 的 achievements 中`);
        }
        
        // 检查该称号下所有成就是否都为 true
        const achievementValues = Object.values(titleInfo.achievements);
        const completedCount = achievementValues.filter(completed => completed === true).length;
        const totalCount = achievementValues.length;
        const allAchievementsUnlocked = completedCount === totalCount && totalCount > 0;
        
        // 更新进度属性
        if (allAchievementsUnlocked) {
            // 所有成就都完成，进度为"已完成"，同时解锁称号
            titleInfo.progress = '已完成';
            titleInfo.unlocked = true;
        } else if (completedCount > 0) {
            // 有成就完成但未全部完成，进度为"进行中"
            titleInfo.progress = '进行中';
        } else {
            // 没有任何成就完成，进度为"未开始"
            titleInfo.progress = '未开始';
        }
    });
    
    // 保存更新后的数据到本地缓存
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_TITLES, JSON.stringify(unlockedTitles));
}

// 显示称号详情
function showTitleDetail(titleName, titleInfo) {
    if (!titleInfo || !titleInfo.achievements) {
        return;
    }
    
    // 设置称号名称
    titleDetailName.textContent = titleName;
    
    // 获取成就数据
    const achievementData = getCachedAchievementData();
    if (!achievementData || !Array.isArray(achievementData)) {
        titleDetailDescriptions.innerHTML = '<p>无法加载成就数据</p>';
        titleDetailModal.classList.add('active');
        return;
    }
    
    // 获取该称号下所有已完成的成就编号
    const completedAchievementIds = [];
    Object.keys(titleInfo.achievements).forEach(achievementId => {
        if (titleInfo.achievements[achievementId] === true) {
            completedAchievementIds.push(parseInt(achievementId));
        }
    });
    
    // 根据成就编号从achievementData中获取描述
    const descriptions = [];
    completedAchievementIds.forEach(achievementId => {
        // 成就编号对应数组索引（编号 - 1）
        const achievementIndex = achievementId - 1;
        if (achievementIndex >= 0 && achievementIndex < achievementData.length) {
            const achievement = achievementData[achievementIndex];
            if (achievement.描述) {
                descriptions.push(achievement.描述);
            }
        }
    });
    
    // 显示所有描述，用明显的分割线分隔
    if (descriptions.length > 0) {
        titleDetailDescriptions.innerHTML = descriptions.map((desc, index) => {
            const separator = index < descriptions.length - 1 ? '<div class="title-description-separator"></div>' : '';
            return `
                <div class="title-description-item">
                    <p class="title-description-text">${desc}</p>
                </div>
                ${separator}
            `;
        }).join('');
    } else {
        titleDetailDescriptions.innerHTML = '<p>暂无描述</p>';
    }
    
    // 显示弹窗
    titleDetailModal.classList.add('active');
}

// 称号按钮事件
titlesBtn.addEventListener('click', () => {
    renderTitles();
    titlesModal.classList.add('active');
});

closeTitlesBtn.addEventListener('click', () => {
    titlesModal.classList.remove('active');
});

// 关闭称号详情弹窗
closeTitleDetailBtn.addEventListener('click', () => {
    titleDetailModal.classList.remove('active');
});

// 点击称号详情模态框背景关闭
titleDetailModal.addEventListener('click', (e) => {
    if (e.target === titleDetailModal) {
        titleDetailModal.classList.remove('active');
    }
});

// 关闭成就结果弹窗
closeAchievementResultBtn.addEventListener('click', () => {
    achievementResultModal.classList.remove('active');
});

// 点击成就结果模态框背景关闭
achievementResultModal.addEventListener('click', (e) => {
    if (e.target === achievementResultModal) {
        achievementResultModal.classList.remove('active');
    }
});

// 点击模态框背景关闭
attributesModal.addEventListener('click', (e) => {
    if (e.target === attributesModal) {
        attributesModal.classList.remove('active');
    }
});

// 点击称号模态框背景关闭
titlesModal.addEventListener('click', (e) => {
    if (e.target === titlesModal) {
        titlesModal.classList.remove('active');
    }
});

// 点击模态框背景关闭（可选）
roleSelectModal.addEventListener('click', (e) => {
    if (e.target === roleSelectModal) {
        // 不允许点击背景关闭身份选择窗口
    }
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

// 读取任务数据文件
async function loadTaskData() {
    try {
        const response = await fetch('data/task.json');
        if (!response.ok) {
            console.warn('无法读取 task.json 文件，使用默认数据');
            return null;
        }
        const data = await response.json();
        
        // 将读取的数据保存到本地缓存
        localStorage.setItem(STORAGE_KEYS.TASK_DATA, JSON.stringify(data));
        
        console.log('任务数据已加载并缓存');
        return data;
    } catch (error) {
        console.error('读取任务数据文件失败:', error);
        return null;
    }
}

// 获取缓存的任务数据
function getCachedTaskData() {
    const cached = localStorage.getItem(STORAGE_KEYS.TASK_DATA);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('解析缓存的任务数据失败:', error);
            return null;
        }
    }
    return null;
}

// 读取成就数据文件
async function loadAchievementData() {
    try {
        const response = await fetch('data/achievement.json');
        if (!response.ok) {
            console.warn('无法读取 achievement.json 文件');
            return null;
        }
        const data = await response.json();
        
        // 为每个成就添加"已获得"属性（默认 false）
        const achievements = data.map(achievement => ({
            ...achievement,
            已获得: false
        }));
        
        // 检查本地缓存中是否已有成就数据（保留已获得的记录）
        const cachedData = getCachedAchievementData();
        if (cachedData && Array.isArray(cachedData)) {
            // 合并已获得的记录
            const achievementMap = new Map();
            // 先以缓存中的数据为准（保留已获得状态）
            cachedData.forEach(cached => {
                achievementMap.set(cached.序号, cached);
            });
            // 然后用新数据更新（如果缓存中没有，添加新成就）
            achievements.forEach(achievement => {
                if (achievementMap.has(achievement.序号)) {
                    // 保留已获得状态
                    achievement.已获得 = achievementMap.get(achievement.序号).已获得 || false;
                }
                achievementMap.set(achievement.序号, achievement);
            });
            // 转换为数组
            const mergedAchievements = Array.from(achievementMap.values())
                .sort((a, b) => a.序号 - b.序号);
            
            // 保存合并后的数据
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_DATA, JSON.stringify(mergedAchievements));

            // 初始化“已解锁称号”对象（只在本地还没有时生成一次）
            initializeUnlockedTitles(mergedAchievements);

            console.log('成就数据已加载并缓存，共', mergedAchievements.length, '个成就');
            return mergedAchievements;
        } else {
            // 首次加载，直接保存
            localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_DATA, JSON.stringify(achievements));

            // 初始化“已解锁称号”对象
            initializeUnlockedTitles(achievements);

            console.log('成就数据已加载并缓存，共', achievements.length, '个成就');
            return achievements;
        }
    } catch (error) {
        console.error('读取成就数据文件失败:', error);
        return null;
    }
}

// 获取缓存的成就数据
function getCachedAchievementData() {
    const cached = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_DATA);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('解析缓存的成就数据失败:', error);
            return null;
        }
    }
    return null;
}

// 初始化“已解锁称号”对象
// 结构示例：
// {
//   "圣徒": {
//       unlocked: false,
//       achievements: { "1": false, "2": false, "3": false }
//   },
//   "血月狼王": {
//       unlocked: false,
//       achievements: { "4": false, "5": false, "6": false }
//   },
//   ...
// }
function initializeUnlockedTitles(achievements) {
    if (!achievements || !Array.isArray(achievements)) return;

    // 如果本地已经有"已解锁称号"数据，则检查并补充 progress 属性
    const cached = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TITLES);
    if (cached) {
        try {
            const unlockedTitles = JSON.parse(cached);
            let needUpdate = false;
            
            // 检查并补充缺失的 progress 属性
            Object.keys(unlockedTitles).forEach(titleName => {
                const titleInfo = unlockedTitles[titleName];
                if (!titleInfo.hasOwnProperty('progress')) {
                    // 如果没有 progress 属性，根据当前状态设置
                    const achievementValues = Object.values(titleInfo.achievements || {});
                    const completedCount = achievementValues.filter(completed => completed === true).length;
                    const totalCount = achievementValues.length;
                    
                    if (completedCount === totalCount && totalCount > 0) {
                        titleInfo.progress = '已完成';
                    } else if (completedCount > 0) {
                        titleInfo.progress = '进行中';
                    } else {
                        titleInfo.progress = '未开始';
                    }
                    needUpdate = true;
                }
            });
            
            // 如果有更新，保存回本地缓存
            if (needUpdate) {
                localStorage.setItem(STORAGE_KEYS.UNLOCKED_TITLES, JSON.stringify(unlockedTitles));
            }
        } catch (error) {
            console.error('解析已解锁称号数据失败:', error);
        }
        return;
    }

    const unlockedTitles = {};

    achievements.forEach(achievement => {
        const titleName = achievement.名称;
        const id = achievement.序号;
        if (!titleName || typeof id === 'undefined') return;

        if (!unlockedTitles[titleName]) {
            unlockedTitles[titleName] = {
                unlocked: false,       // 整体称号是否解锁（初始都是 false）
                achievements: {},      // 该称号下各成就的完成情况
                progress: '未开始'     // 进度：未开始/进行中/已完成
            };
        }
        // 序号作为成就ID，初始全部未完成
        unlockedTitles[titleName].achievements[String(id)] = false;
    });

    localStorage.setItem(STORAGE_KEYS.UNLOCKED_TITLES, JSON.stringify(unlockedTitles));
}

// 获取已解锁称号对象
function getUnlockedTitles() {
    const cached = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TITLES);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (error) {
            console.error('解析已解锁称号数据失败:', error);
            return {};
        }
    }
    return {};
}

// 获取所有唯一的称号名称
function getAllUniqueTitles() {
    const achievements = getCachedAchievementData();
    if (!achievements || !Array.isArray(achievements)) {
        return [];
    }
    
    // 使用Set去重，获取所有唯一的称号名称
    const uniqueTitles = new Set();
    achievements.forEach(achievement => {
        if (achievement.名称) {
            uniqueTitles.add(achievement.名称);
        }
    });
    
    return Array.from(uniqueTitles);
}

// 渲染称号卡片
function renderTitles() {
    if (!titlesList) return;
    
    const allTitles = getAllUniqueTitles();
    const unlockedTitles = getUnlockedTitles();
    
    // 清空列表
    titlesList.innerHTML = '';
    
    if (allTitles.length === 0) {
        titlesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">暂无称号数据</p>';
        return;
    }
    
    // 为每个称号创建卡片
    allTitles.forEach(titleName => {
        const titleCard = document.createElement('div');
        titleCard.className = 'title-card';
        
        const titleInfo = unlockedTitles[titleName];
        const isUnlocked = titleInfo && titleInfo.unlocked === true;
        const progress = titleInfo && titleInfo.progress ? titleInfo.progress : '未开始';
        
        if (isUnlocked) {
            // 已解锁：显示称号名称，可点击
            titleCard.classList.add('unlocked');
            titleCard.innerHTML = `
                <div class="title-name">${titleName}</div>
            `;
            // 添加点击事件，显示称号详情
            titleCard.addEventListener('click', () => {
                showTitleDetail(titleName, titleInfo);
            });
        } else if (progress === '进行中') {
            // 未解锁但进行中：显示称号名称和进度信息
            const achievements = titleInfo.achievements || {};
            const achievementValues = Object.values(achievements);
            const completedCount = achievementValues.filter(completed => completed === true).length;
            const totalCount = achievementValues.length;
            
            titleCard.classList.add('in-progress');
            titleCard.style.cursor = 'not-allowed';
            titleCard.innerHTML = `
                <div class="title-name">${titleName}</div>
                <div class="title-progress">（${completedCount}/${totalCount}）</div>
            `;
        } else {
            // 未解锁且未开始：显示三个问号，不可点击
            titleCard.classList.add('locked');
            titleCard.style.cursor = 'not-allowed';
            titleCard.innerHTML = `
                <div class="title-name">???</div>
            `;
        }
        
        titlesList.appendChild(titleCard);
    });
}

// 页面加载时检查是否已初始化
window.addEventListener('load', async () => {
    // 首先尝试读取任务数据文件并缓存
    await loadTaskData();
    // 读取成就数据文件并缓存
    await loadAchievementData();
    
    // 检查是否已初始化
    if (isInitialized() && loadPlayerName()) {
        // 如果已初始化，直接进入主界面
        initScreen.classList.remove('active');
        
        // 加载任务列表
        loadTasks();
        
        // 恢复任务定时器
        const taskStartTime = localStorage.getItem(STORAGE_KEYS.TASK_START_TIME) || DEFAULT_TASK_START_TIME;
        const taskEndTime = localStorage.getItem(STORAGE_KEYS.TASK_END_TIME) || DEFAULT_TASK_END_TIME;
        const taskFrequency = parseInt(localStorage.getItem(STORAGE_KEYS.TASK_FREQUENCY)) || DEFAULT_TASK_FREQUENCY;
        startTaskTimer(taskStartTime, taskEndTime, taskFrequency);
        
        // 检查是否需要显示身份选择窗口
        if (shouldShowRoleSelect()) {
            showRoleSelectModal();
        } else {
            // 加载已保存的身份
            loadPlayerRole();
            mainScreen.classList.add('active');
        }
    } else {
        // 如果未初始化，加载默认设置或已保存的设置
        loadInitSettings();
        // 聚焦输入框
        playerNameInput.focus();
    }
});