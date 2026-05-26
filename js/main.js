// メインアプリケーションロジック
class SortingApp {
    constructor() {
        this.algorithms = new SortingAlgorithms();
        this.visualizer = new Visualizer('visualizationContainer');
        this.currentArray = [];
        this.sortingSteps = new Map();
        this.currentStepIndex = new Map();
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 500; // デフォルト速度(ms)
        this.compareMode = false;
        this.selectedAlgorithms = new Set(['quick', 'merge']);
        
        this.initializeEventListeners();
        this.generateRandomArray();
    }

    // イベントリスナーの初期化
    initializeEventListeners() {
        // 配列サイズスライダー
        document.getElementById('arraySize').addEventListener('input', (e) => {
            document.getElementById('arraySizeValue').textContent = e.target.value;
        });

        // 速度スライダー
        document.getElementById('speed').addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            const speedLabels = ['最遅', 'かなり遅い', '遅い', 'やや遅い', '普通', 
                               'やや速い', '速い', 'かなり速い', '最速', '超高速'];
            document.getElementById('speedValue').textContent = speedLabels[speed - 1];
            // 速度を逆転（1=遅い、10=速い）
            this.animationSpeed = 1100 - (speed * 100);
        });

        // ランダム生成ボタン
        document.getElementById('randomBtn').addEventListener('click', () => {
            this.generateRandomArray();
        });

        // カスタム入力ボタン
        document.getElementById('customBtn').addEventListener('click', () => {
            const inputArea = document.getElementById('customInputArea');
            inputArea.style.display = inputArea.style.display === 'none' ? 'block' : 'none';
        });

        // カスタム配列適用ボタン
        document.getElementById('applyCustomBtn').addEventListener('click', () => {
            this.applyCustomArray();
        });

        // 比較モードチェックボックス
        document.getElementById('compareMode').addEventListener('change', (e) => {
            this.compareMode = e.target.checked;
        });

        // アルゴリズム選択チェックボックス
        document.querySelectorAll('.algo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedAlgorithms.add(e.target.value);
                } else {
                    this.selectedAlgorithms.delete(e.target.value);
                }
            });
        });

        // 実行コントロールボタン
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pause();
        });

        document.getElementById('stepBtn').addEventListener('click', () => {
            this.step();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
    }

    // ランダム配列生成
    generateRandomArray() {
        const size = parseInt(document.getElementById('arraySize').value);
        this.currentArray = [];
        for (let i = 0; i < size; i++) {
            this.currentArray.push(Math.floor(Math.random() * 100) + 1);
        }
        this.reset();
    }

    // カスタム配列適用
    applyCustomArray() {
        const input = document.getElementById('customArray').value;
        const numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        if (numbers.length === 0) {
            alert('有効な数値を入力してください（例: 5,3,8,1,9,2,7,4,6）');
            return;
        }

        this.currentArray = numbers;
        document.getElementById('arraySize').value = numbers.length;
        document.getElementById('arraySizeValue').textContent = numbers.length;
        this.reset();
    }

    // ソート開始
    async start() {
        if (this.selectedAlgorithms.size === 0) {
            alert('少なくとも1つのアルゴリズムを選択してください');
            return;
        }

        if (this.isRunning && this.isPaused) {
            // 一時停止から再開
            this.isPaused = false;
            this.updateButtonStates();
            this.resumeAnimation();
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.updateButtonStates();

        // 視覚化エリアをクリア
        this.visualizer.clear();
        this.sortingSteps.clear();
        this.currentStepIndex.clear();

        // 選択されたアルゴリズムごとに準備
        for (const algoId of this.selectedAlgorithms) {
            const info = algorithmInfo[algoId];
            this.visualizer.createVisualization(algoId, info.displayName);
            this.visualizer.initializeBars(algoId, this.currentArray);
            this.visualizer.updateStatus(algoId, '実行中');

            // ソートステップを生成
            let steps;
            switch (algoId) {
                case 'quick':
                    steps = this.algorithms.quickSort(this.currentArray);
                    break;
                case 'merge':
                    steps = this.algorithms.mergeSort(this.currentArray);
                    break;
                case 'bubble':
                    steps = this.algorithms.bubbleSort(this.currentArray);
                    break;
                case 'selection':
                    steps = this.algorithms.selectionSort(this.currentArray);
                    break;
                case 'insertion':
                    steps = this.algorithms.insertionSort(this.currentArray);
                    break;
            }
            
            this.sortingSteps.set(algoId, steps);
            this.currentStepIndex.set(algoId, 0);
        }

        // アニメーション開始
        await this.animate();
    }

    // アニメーション
    async animate() {
        const algorithms = Array.from(this.selectedAlgorithms);
        let allCompleted = false;

        while (!allCompleted && this.isRunning && !this.isPaused) {
            allCompleted = true;

            for (const algoId of algorithms) {
                const steps = this.sortingSteps.get(algoId);
                const stepIndex = this.currentStepIndex.get(algoId);

                if (stepIndex < steps.length) {
                    allCompleted = false;
                    const step = steps[stepIndex];
                    this.visualizer.updateBars(algoId, step);
                    this.currentStepIndex.set(algoId, stepIndex + 1);
                }
            }

            if (!allCompleted) {
                await this.sleep(this.animationSpeed);
            }
        }

        if (allCompleted) {
            this.isRunning = false;
            this.updateButtonStates();
            this.updateFinalStats();
        }
    }

    // アニメーション再開
    async resumeAnimation() {
        await this.animate();
    }

    // 一時停止
    pause() {
        this.isPaused = true;
        this.updateButtonStates();
    }

    // 1ステップ実行
    step() {
        if (!this.isRunning) {
            this.start();
            this.isPaused = true;
            this.updateButtonStates();
            return;
        }

        const algorithms = Array.from(this.selectedAlgorithms);
        for (const algoId of algorithms) {
            const steps = this.sortingSteps.get(algoId);
            const stepIndex = this.currentStepIndex.get(algoId);

            if (stepIndex < steps.length) {
                const step = steps[stepIndex];
                this.visualizer.updateBars(algoId, step);
                this.currentStepIndex.set(algoId, stepIndex + 1);
            }
        }
    }

    // リセット
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.sortingSteps.clear();
        this.currentStepIndex.clear();
        
        this.visualizer.clear();
        document.getElementById('statsContainer').innerHTML = '';
        
        this.updateButtonStates();
    }

    // ボタン状態更新
    updateButtonStates() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stepBtn = document.getElementById('stepBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (this.isRunning && !this.isPaused) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stepBtn.disabled = true;
            resetBtn.disabled = true;
        } else if (this.isRunning && this.isPaused) {
            startBtn.disabled = false;
            startBtn.textContent = '▶️ 再開';
            pauseBtn.disabled = true;
            stepBtn.disabled = false;
            resetBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            startBtn.textContent = '▶️ 開始';
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            resetBtn.disabled = false;
        }
    }

    // 最終統計更新
    updateFinalStats() {
        const statsContainer = document.getElementById('statsContainer');
        statsContainer.innerHTML = '';

        for (const algoId of this.selectedAlgorithms) {
            const info = algorithmInfo[algoId];
            const statsCard = this.visualizer.generateStatsCard(algoId, info.displayName);
            statsContainer.innerHTML += statsCard;
        }
    }

    // スリープ関数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// アプリケーション初期化
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SortingApp();
});
