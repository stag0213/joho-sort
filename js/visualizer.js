// 視覚化クラス
class Visualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.visualizations = new Map();
    }

    // 視覚化エリアを作成
    createVisualization(algorithmId, algorithmName) {
        const vizDiv = document.createElement('div');
        vizDiv.className = 'algo-visualization';
        vizDiv.id = `viz-${algorithmId}`;

        // アルゴリズムごとの凡例を生成
        const legend = this.getAlgorithmLegend(algorithmId);

        vizDiv.innerHTML = `
            <div class="algo-header">
                <div class="algo-name">${algorithmName}</div>
                <div class="algo-status">
                    <div class="status-item">
                        <div class="status-label">比較回数</div>
                        <div class="status-value" id="compares-${algorithmId}">0</div>
                    </div>
                    <div class="status-item">
                        <div class="status-label">交換回数</div>
                        <div class="status-value" id="swaps-${algorithmId}">0</div>
                    </div>
                    <div class="status-item">
                        <div class="status-label">経過時間</div>
                        <div class="status-value" id="time-${algorithmId}">0ms</div>
                    </div>
                    <div class="status-item">
                        <div class="status-label">ステータス</div>
                        <div class="status-value" id="status-${algorithmId}">待機中</div>
                    </div>
                </div>
            </div>
            ${legend}
            <div class="bars-container" id="bars-${algorithmId}"></div>
        `;

        this.container.appendChild(vizDiv);
        
        this.visualizations.set(algorithmId, {
            element: vizDiv,
            barsContainer: vizDiv.querySelector(`#bars-${algorithmId}`),
            comparesEl: vizDiv.querySelector(`#compares-${algorithmId}`),
            swapsEl: vizDiv.querySelector(`#swaps-${algorithmId}`),
            timeEl: vizDiv.querySelector(`#time-${algorithmId}`),
            statusEl: vizDiv.querySelector(`#status-${algorithmId}`),
            compares: 0,
            swaps: 0,
            startTime: 0
        });
    }

    // アルゴリズムごとの色の凡例を取得
    getAlgorithmLegend(algorithmId) {
        const legends = {
            quick: `
                <div class="color-legend">
                    <div class="legend-item">
                        <div class="legend-color default"></div>
                        <span>未整列</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color pivot"></div>
                        <span>ピボット</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color comparing"></div>
                        <span>比較中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color swapping"></div>
                        <span>交換中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color sorted"></div>
                        <span>整列済み</span>
                    </div>
                </div>
            `,
            merge: `
                <div class="color-legend">
                    <div class="legend-item">
                        <div class="legend-color default"></div>
                        <span>未整列</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color comparing"></div>
                        <span>比較中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color merging"></div>
                        <span>マージ中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color sorted"></div>
                        <span>整列済み</span>
                    </div>
                </div>
            `,
            bubble: `
                <div class="color-legend">
                    <div class="legend-item">
                        <div class="legend-color default"></div>
                        <span>未整列</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color comparing"></div>
                        <span>比較中のペア</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color swapping"></div>
                        <span>交換中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color sorted"></div>
                        <span>確定した要素</span>
                    </div>
                </div>
            `,
            selection: `
                <div class="color-legend">
                    <div class="legend-item">
                        <div class="legend-color default"></div>
                        <span>未整列</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color minimum"></div>
                        <span>現在の最小値</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color comparing"></div>
                        <span>探索中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color swapping"></div>
                        <span>交換中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color sorted"></div>
                        <span>整列済み</span>
                    </div>
                </div>
            `,
            insertion: `
                <div class="color-legend">
                    <div class="legend-item">
                        <div class="legend-color default"></div>
                        <span>未整列</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color inserting"></div>
                        <span>挿入する要素</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color comparing"></div>
                        <span>比較中</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color sorted-light"></div>
                        <span>整列済み部分</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color sorted"></div>
                        <span>完全に整列</span>
                    </div>
                </div>
            `
        };

        return legends[algorithmId] || '';
    }

    // 視覚化エリアをクリア
    clear() {
        this.container.innerHTML = '';
        this.visualizations.clear();
    }

    // バーを初期化
    initializeBars(algorithmId, array) {
        const viz = this.visualizations.get(algorithmId);
        if (!viz) return;

        viz.barsContainer.innerHTML = '';
        viz.compares = 0;
        viz.swaps = 0;
        viz.startTime = Date.now();

        this.updateStats(algorithmId);

        const maxValue = Math.max(...array);
        const containerHeight = viz.barsContainer.offsetHeight || 300;

        array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.id = `${algorithmId}-bar-${index}`;
            
            const height = (value / maxValue) * (containerHeight - 40);
            bar.style.height = `${height}px`;

            const valueLabel = document.createElement('div');
            valueLabel.className = 'bar-value';
            valueLabel.textContent = value;
            bar.appendChild(valueLabel);

            viz.barsContainer.appendChild(bar);
        });
    }

    // 統計情報を更新
    updateStats(algorithmId) {
        const viz = this.visualizations.get(algorithmId);
        if (!viz) return;

        viz.comparesEl.textContent = viz.compares;
        viz.swapsEl.textContent = viz.swaps;
        
        const elapsed = Date.now() - viz.startTime;
        viz.timeEl.textContent = `${elapsed}ms`;
    }

    // ステータスを更新
    updateStatus(algorithmId, status) {
        const viz = this.visualizations.get(algorithmId);
        if (!viz) return;

        viz.statusEl.textContent = status;
    }

    // バーのスタイルを更新
    updateBars(algorithmId, step) {
        const viz = this.visualizations.get(algorithmId);
        if (!viz) return;

        // 全てのバーをリセット（ただしsortedは保持）
        const bars = viz.barsContainer.querySelectorAll('.bar');
        const sortedBars = new Set();
        
        bars.forEach((bar, idx) => {
            if (bar.classList.contains('sorted')) {
                sortedBars.add(idx);
            }
            bar.className = 'bar';
            if (sortedBars.has(idx)) {
                bar.classList.add('sorted');
            }
        });

        // ステップタイプに応じてスタイルを適用
        switch (step.type) {
            case 'compare':
                viz.compares++;
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar && !bar.classList.contains('sorted')) {
                        bar.classList.add('comparing');
                    }
                });
                break;

            case 'swap':
                viz.swaps++;
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar && !bar.classList.contains('sorted')) {
                        bar.classList.add('swapping');
                    }
                });
                break;

            case 'pivot':
                // クイックソート用：ピボット要素
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar && !bar.classList.contains('sorted')) {
                        bar.classList.add('pivot');
                    }
                });
                break;

            case 'sorted':
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar) {
                        bar.className = 'bar sorted';
                    }
                });
                break;

            case 'sorted-light':
                // 挿入ソート用：整列済み部分
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar && !bar.classList.contains('sorted')) {
                        bar.classList.add('sorted-light');
                    }
                });
                break;

            case 'merge':
                // マージソート用：マージ中の要素
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar && !bar.classList.contains('sorted')) {
                        bar.classList.add('merging');
                    }
                });
                break;

            case 'minimum':
                // 選択ソート用：現在の最小値
                viz.compares++;
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar && !bar.classList.contains('sorted')) {
                        bar.classList.add('minimum');
                    }
                });
                break;

            case 'inserting':
                // 挿入ソート用：挿入する要素
                step.indices.forEach(idx => {
                    const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                    if (bar) {
                        bar.classList.remove('sorted-light');
                        bar.classList.add('inserting');
                    }
                });
                break;

            case 'completed':
                bars.forEach(bar => {
                    bar.className = 'bar sorted';
                });
                this.updateStatus(algorithmId, '完了');
                break;
        }

        // クイックソート専用：ピボットを常に表示
        if (algorithmId === 'quick' && step.pivotIndex !== undefined && step.type !== 'completed') {
            const pivotBar = document.getElementById(`${algorithmId}-bar-${step.pivotIndex}`);
            if (pivotBar && !pivotBar.classList.contains('sorted')) {
                // ピボットを最優先で表示（他のクラスより優先）
                pivotBar.classList.remove('comparing');
                pivotBar.classList.add('pivot');
            }
        }

        // 挿入ソート専用：整列済み部分を維持
        if (algorithmId === 'insertion' && step.sortedIndices) {
            step.sortedIndices.forEach(idx => {
                const bar = document.getElementById(`${algorithmId}-bar-${idx}`);
                if (bar && !bar.classList.contains('sorted') && !bar.classList.contains('inserting')) {
                    bar.classList.add('sorted-light');
                }
            });
        }

        // バーの高さを更新
        this.updateBarHeights(algorithmId, step.array);
        this.updateStats(algorithmId);
    }

    // バーの高さを更新
    updateBarHeights(algorithmId, array) {
        const viz = this.visualizations.get(algorithmId);
        if (!viz) return;

        const maxValue = Math.max(...array);
        const containerHeight = viz.barsContainer.offsetHeight || 300;

        array.forEach((value, index) => {
            const bar = document.getElementById(`${algorithmId}-bar-${index}`);
            if (bar) {
                const height = (value / maxValue) * (containerHeight - 40);
                bar.style.height = `${height}px`;
                
                const valueLabel = bar.querySelector('.bar-value');
                if (valueLabel) {
                    valueLabel.textContent = value;
                }
            }
        });
    }

    // 統計カードを生成
    generateStatsCard(algorithmId, algorithmName) {
        const viz = this.visualizations.get(algorithmId);
        if (!viz) return '';

        const elapsed = Date.now() - viz.startTime;

        return `
            <div class="stat-card">
                <h4>${algorithmName}</h4>
                <div class="stat-item">
                    <span class="stat-label">比較回数:</span>
                    <span class="stat-value">${viz.compares}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">交換回数:</span>
                    <span class="stat-value">${viz.swaps}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">実行時間:</span>
                    <span class="stat-value">${elapsed}ms</span>
                </div>
            </div>
        `;
    }
}
