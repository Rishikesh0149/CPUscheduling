
import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class OSProcessSchedulingSimulator extends JFrame {

    private final DefaultTableModel model;
    private final JTable processTable;
    private final DefaultListModel<String> queueModel;
    private final JList<String> readyQueue;
    private final JLabel status;

    public OSProcessSchedulingSimulator() {
        setTitle("OS Process Management and CPU Scheduling Simulator");
        setSize(1000, 550);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JLabel heading = new JLabel(
                "OS Process Management and CPU Scheduling Simulator",
                SwingConstants.CENTER);
        heading.setFont(new Font("Arial", Font.BOLD, 20));

        String[] columns = {
                "PID", "Arrival Time", "Burst Time", "Priority", "State"
        };

        model = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        processTable = new JTable(model);

        queueModel = new DefaultListModel<>();
        readyQueue = new JList<>(queueModel);

        JPanel queuePanel = new JPanel(new BorderLayout());
        queuePanel.setBorder(BorderFactory.createTitledBorder("Ready Queue"));
        queuePanel.add(new JScrollPane(readyQueue), BorderLayout.CENTER);
        queuePanel.setPreferredSize(new Dimension(180, 200));

        JButton addButton = new JButton("Add Process");
        JButton removeButton = new JButton("Remove Selected");
        JButton clearButton = new JButton("Clear All");
        JButton readyButton = new JButton("Move to Ready");
        JButton runButton = new JButton("Run Scheduler");
        JButton compareButton = new JButton("Compare Algorithms");

        status = new JLabel("Ready to manage processes",
                SwingConstants.CENTER);

        addButton.addActionListener(e -> addProcess());

        removeButton.addActionListener(e -> {
            int selected = processTable.getSelectedRow();

            if (selected == -1) {
                showError("Select a process first.");
                return;
            }

            String pid = model.getValueAt(selected, 0).toString();
            model.removeRow(selected);
            refreshQueue();
            status.setText(pid + " removed.");
        });

        clearButton.addActionListener(e -> {
            model.setRowCount(0);
            refreshQueue();
            status.setText("All processes cleared.");
        });

        readyButton.addActionListener(e -> moveToReady());

        runButton.addActionListener(e -> chooseAlgorithm());
        compareButton.addActionListener(e -> compareAlgorithms());

        JPanel buttons = new JPanel(new FlowLayout());
        buttons.add(addButton);
        buttons.add(removeButton);
        buttons.add(clearButton);
        buttons.add(readyButton);
        buttons.add(runButton);
        buttons.add(compareButton);

        JPanel centerPanel = new JPanel(new BorderLayout(8, 8));
        centerPanel.add(new JScrollPane(processTable),
                BorderLayout.CENTER);
        centerPanel.add(queuePanel, BorderLayout.EAST);

        JPanel bottom = new JPanel(new BorderLayout());
        bottom.add(status, BorderLayout.CENTER);
        bottom.add(buttons, BorderLayout.SOUTH);

        setLayout(new BorderLayout(8, 8));
        add(heading, BorderLayout.NORTH);
        add(centerPanel, BorderLayout.CENTER);
        add(bottom, BorderLayout.SOUTH);
    }

    private void addProcess() {
        JTextField pidField = new JTextField();
        JTextField arrivalField = new JTextField("0");
        JTextField burstField = new JTextField();
        JTextField priorityField = new JTextField("1");

        JPanel panel = new JPanel(new GridLayout(0, 2, 8, 8));
        panel.add(new JLabel("Process ID:"));
        panel.add(pidField);
        panel.add(new JLabel("Arrival Time:"));
        panel.add(arrivalField);
        panel.add(new JLabel("Burst Time:"));
        panel.add(burstField);
        panel.add(new JLabel("Priority (smaller = higher):"));
        panel.add(priorityField);

        int result = JOptionPane.showConfirmDialog(
                this, panel, "Add New Process",
                JOptionPane.OK_CANCEL_OPTION,
                JOptionPane.PLAIN_MESSAGE);

        if (result != JOptionPane.OK_OPTION) {
            return;
        }

        String pid = pidField.getText().trim();

        if (pid.isEmpty()) {
            showError("Process ID cannot be empty.");
            return;
        }

        for (int i = 0; i < model.getRowCount(); i++) {
            if (pid.equalsIgnoreCase(
                    model.getValueAt(i, 0).toString())) {
                showError("This Process ID already exists.");
                return;
            }
        }

        try {
            int arrival = Integer.parseInt(
                    arrivalField.getText().trim());
            int burst = Integer.parseInt(
                    burstField.getText().trim());
            int priority = Integer.parseInt(
                    priorityField.getText().trim());

            if (arrival < 0 || burst <= 0 || priority < 0) {
                showError("Arrival and priority must be non-negative; "
                        + "burst time must be positive.");
                return;
            }

            model.addRow(new Object[] {
                    pid, arrival, burst, priority, "NEW"
            });

            refreshQueue();
            status.setText(pid + " added successfully.");

        } catch (NumberFormatException ex) {
            showError("Enter valid whole numbers for arrival, burst "
                    + "and priority.");
        }
    }

    private void moveToReady() {
        int selected = processTable.getSelectedRow();

        if (selected == -1) {
            showError("Select a process first.");
            return;
        }

        String state = model.getValueAt(selected, 4).toString();
        String pid = model.getValueAt(selected, 0).toString();

        if (!state.equals("NEW")) {
            showError("Only NEW processes can move to READY.");
            return;
        }

        model.setValueAt("READY", selected, 4);
        refreshQueue();
        status.setText(pid + " moved to Ready Queue.");
    }

    private void refreshQueue() {
        queueModel.clear();

        for (int i = 0; i < model.getRowCount(); i++) {
            if (model.getValueAt(i, 4).toString().equals("READY")) {
                queueModel.addElement(
                        model.getValueAt(i, 0).toString());
            }
        }
    }

    private void runFCFS() {
        if (model.getRowCount() == 0) {
            showError("Add at least one process first.");
            return;
        }

        List<ProcessInfo> processes = new ArrayList<>();

        for (int i = 0; i < model.getRowCount(); i++) {
            processes.add(new ProcessInfo(
                    model.getValueAt(i, 0).toString(),
                    Integer.parseInt(model.getValueAt(i, 1).toString()),
                    Integer.parseInt(model.getValueAt(i, 2).toString()),
                    Integer.parseInt(model.getValueAt(i, 3).toString()),
                    i));
        }

        // FCFS: sort by arrival time; preserve input order for ties.
        processes.sort(Comparator
                .comparingInt((ProcessInfo p) -> p.arrival)
                .thenComparingInt(p -> p.inputOrder));

        int clock = 0;
        int totalWT = 0;
        int totalTAT = 0;
        int totalRT = 0;

        StringBuilder gantt = new StringBuilder();
        StringBuilder timeline = new StringBuilder();

        DefaultTableModel results = new DefaultTableModel(
                new String[] { "PID", "AT", "BT", "CT", "TAT", "WT", "RT" },
                0);

        for (ProcessInfo p : processes) {
            if (clock < p.arrival) {
                gantt.append("| IDLE ");
                timeline.append(clock).append(" - ")
                        .append(p.arrival).append(" : IDLE\n");
                clock = p.arrival;
            }

            p.start = clock;
            p.completion = clock + p.burst;
            p.tat = p.completion - p.arrival;
            p.waiting = p.tat - p.burst;
            p.response = p.start - p.arrival;

            gantt.append("| ").append(p.pid).append(" ");
            timeline.append(clock).append(" - ")
                    .append(p.completion).append(" : ")
                    .append(p.pid).append("\n");

            clock = p.completion;

            totalWT += p.waiting;
            totalTAT += p.tat;
            totalRT += p.response;

            results.addRow(new Object[] {
                    p.pid, p.arrival, p.burst,
                    p.completion, p.tat, p.waiting, p.response
            });
        }

        gantt.append("|");
        timeline.append("Final time: ").append(clock);

        double n = processes.size();

        JTextArea chart = new JTextArea(
                "GANTT CHART\n\n" + gantt + "\n\n"
                        + timeline + "\n\n"
                        + String.format("Average Waiting Time: %.2f\n",
                                totalWT / n)
                        + String.format("Average Turnaround Time: %.2f\n",
                                totalTAT / n)
                        + String.format("Average Response Time: %.2f\n",
                                totalRT / n));
        chart.setEditable(false);
        chart.setFont(new Font("Monospaced", Font.PLAIN, 14));

        JTable resultTable = new JTable(results);

        JPanel output = new JPanel(new BorderLayout(8, 8));
        output.add(new JScrollPane(chart), BorderLayout.NORTH);
        output.add(new JScrollPane(resultTable), BorderLayout.CENTER);

        output.setPreferredSize(new Dimension(700, 400));

        JOptionPane.showMessageDialog(
                this, output, "FCFS Scheduling Results",
                JOptionPane.INFORMATION_MESSAGE);

        // Update process states after the simulated execution.
        for (int i = 0; i < model.getRowCount(); i++) {
            model.setValueAt("TERMINATED", i, 4);
        }

        refreshQueue();
        status.setText("FCFS scheduling completed.");
    }

    private void chooseAlgorithm() {
        String[] algorithms = {
                "FCFS",
                "SJF (Non-Preemptive)",
                "SRTF (Preemptive)",
                "Priority (Non-Preemptive)",
                "Round Robin"
        };

        String choice = (String) JOptionPane.showInputDialog(
                this,
                "Select CPU Scheduling Algorithm:",
                "Scheduling Algorithm",
                JOptionPane.QUESTION_MESSAGE,
                null,
                algorithms,
                algorithms[0]);

        if (choice == null) {
            return;
        }

        switch (choice) {
            case "FCFS":
                runFCFS();
                break;

            case "SJF (Non-Preemptive)":
                runSJF();
                break;

            case "SRTF (Preemptive)":
                runSRTF();
                break;

            case "Priority (Non-Preemptive)":
                runPriority();
                break;

            case "Round Robin":
                runRoundRobin();
                break;
        }
    }

    private void runSJF() {
        if (model.getRowCount() == 0) {
            showError("Add at least one process first.");
            return;
        }

        List<ProcessInfo> jobs = new ArrayList<>();

        for (int i = 0; i < model.getRowCount(); i++) {
            jobs.add(new ProcessInfo(
                    model.getValueAt(i, 0).toString(),
                    Integer.parseInt(model.getValueAt(i, 1).toString()),
                    Integer.parseInt(model.getValueAt(i, 2).toString()),
                    Integer.parseInt(model.getValueAt(i, 3).toString()), i));
        }

        List<ProcessInfo> completed = new ArrayList<>();
        int time = 0, totalWT = 0, totalTAT = 0, totalRT = 0;

        StringBuilder gantt = new StringBuilder("GANTT CHART\n\n");
        StringBuilder timeline = new StringBuilder();

        while (completed.size() < jobs.size()) {
            ProcessInfo best = null;

            for (ProcessInfo p : jobs) {
                if (!completed.contains(p) && p.arrival <= time) {
                    if (best == null
                            || p.burst < best.burst
                            || (p.burst == best.burst
                                    && p.arrival < best.arrival)
                            || (p.burst == best.burst
                                    && p.arrival == best.arrival
                                    && p.inputOrder < best.inputOrder)) {
                        best = p;
                    }
                }
            }

            if (best == null) {
                int nextArrival = Integer.MAX_VALUE;

                for (ProcessInfo p : jobs) {
                    if (!completed.contains(p)) {
                        nextArrival = Math.min(nextArrival, p.arrival);
                    }
                }

                gantt.append("| IDLE ");
                timeline.append(time).append(" - ")
                        .append(nextArrival).append(" : IDLE\n");
                time = nextArrival;
                continue;
            }

            best.start = time;
            best.completion = time + best.burst;
            best.tat = best.completion - best.arrival;
            best.waiting = best.tat - best.burst;
            best.response = best.start - best.arrival;

            gantt.append("| ").append(best.pid).append(" ");
            timeline.append(time).append(" - ")
                    .append(best.completion).append(" : ")
                    .append(best.pid).append("\n");

            time = best.completion;
            totalWT += best.waiting;
            totalTAT += best.tat;
            totalRT += best.response;
            completed.add(best);
        }

        showSchedulingResults(
                "SJF (Non-Preemptive)", completed,
                gantt.toString(), timeline.toString(),
                totalWT, totalTAT, totalRT);
    }

    private void runSRTF() {
        if (model.getRowCount() == 0) {
            showError("Add at least one process first.");
            return;
        }

        List<ProcessInfo> jobs = new ArrayList<>();

        for (int i = 0; i < model.getRowCount(); i++) {
            jobs.add(new ProcessInfo(
                    model.getValueAt(i, 0).toString(),
                    Integer.parseInt(model.getValueAt(i, 1).toString()),
                    Integer.parseInt(model.getValueAt(i, 2).toString()),
                    Integer.parseInt(model.getValueAt(i, 3).toString()), i));
        }

        int n = jobs.size();
        int[] remaining = new int[n];
        int[] firstStart = new int[n];
        int[] completion = new int[n];

        java.util.Arrays.fill(firstStart, -1);
        for (int i = 0; i < n; i++) {
            remaining[i] = jobs.get(i).burst;
        }

        int time = 0, finished = 0;
        int totalWT = 0, totalTAT = 0, totalRT = 0;

        StringBuilder gantt = new StringBuilder("GANTT CHART\n\n");
        StringBuilder timeline = new StringBuilder();
        String lastPID = null;
        int segmentStart = 0;

        while (finished < n) {
            int best = -1;

            for (int i = 0; i < n; i++) {
                ProcessInfo p = jobs.get(i);

                if (remaining[i] > 0 && p.arrival <= time) {
                    if (best == -1
                            || remaining[i] < remaining[best]
                            || (remaining[i] == remaining[best]
                                    && p.arrival < jobs.get(best).arrival)
                            || (remaining[i] == remaining[best]
                                    && p.arrival == jobs.get(best).arrival
                                    && p.inputOrder < jobs.get(best).inputOrder)) {
                        best = i;
                    }
                }
            }

            String currentPID = best == -1
                    ? "IDLE"
                    : jobs.get(best).pid;

            if (lastPID == null) {
                lastPID = currentPID;
                segmentStart = time;
            } else if (!lastPID.equals(currentPID)) {
                gantt.append("| ").append(lastPID).append(" ");
                timeline.append(segmentStart).append(" - ")
                        .append(time).append(" : ")
                        .append(lastPID).append("\n");

                lastPID = currentPID;
                segmentStart = time;
            }

            if (best == -1) {
                time++;
                continue;
            }

            if (firstStart[best] == -1) {
                firstStart[best] = time;
            }

            remaining[best]--;
            time++;

            if (remaining[best] == 0) {
                completion[best] = time;
                finished++;
            }
        }

        gantt.append("| ").append(lastPID).append(" ");
        timeline.append(segmentStart).append(" - ")
                .append(time).append(" : ").append(lastPID).append("\n");

        List<ProcessInfo> results = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            ProcessInfo p = jobs.get(i);
            p.start = firstStart[i];
            p.completion = completion[i];
            p.tat = p.completion - p.arrival;
            p.waiting = p.tat - p.burst;
            p.response = p.start - p.arrival;

            totalWT += p.waiting;
            totalTAT += p.tat;
            totalRT += p.response;
            results.add(p);
        }

        showSchedulingResults(
                "SRTF (Preemptive)", results,
                gantt.toString(), timeline.toString(),
                totalWT, totalTAT, totalRT);
    }

    private void runPriority() {
        if (model.getRowCount() == 0) {
            showError("Add at least one process first.");
            return;
        }

        List<ProcessInfo> jobs = new ArrayList<>();

        for (int i = 0; i < model.getRowCount(); i++) {
            jobs.add(new ProcessInfo(
                    model.getValueAt(i, 0).toString(),
                    Integer.parseInt(model.getValueAt(i, 1).toString()),
                    Integer.parseInt(model.getValueAt(i, 2).toString()),
                    Integer.parseInt(model.getValueAt(i, 3).toString()),
                    i));
        }

        List<ProcessInfo> completed = new ArrayList<>();
        int time = 0;
        int totalWT = 0, totalTAT = 0, totalRT = 0;

        StringBuilder gantt = new StringBuilder("GANTT CHART\n\n");
        StringBuilder timeline = new StringBuilder();

        while (completed.size() < jobs.size()) {
            ProcessInfo best = null;

            for (ProcessInfo p : jobs) {
                if (!completed.contains(p) && p.arrival <= time) {
                    if (best == null
                            || p.priority < best.priority
                            || (p.priority == best.priority
                                    && p.arrival < best.arrival)
                            || (p.priority == best.priority
                                    && p.arrival == best.arrival
                                    && p.inputOrder < best.inputOrder)) {
                        best = p;
                    }
                }
            }

            if (best == null) {
                int nextArrival = Integer.MAX_VALUE;

                for (ProcessInfo p : jobs) {
                    if (!completed.contains(p)) {
                        nextArrival = Math.min(nextArrival, p.arrival);
                    }
                }

                gantt.append("| IDLE ");
                timeline.append(time).append(" - ")
                        .append(nextArrival).append(" : IDLE\n");
                time = nextArrival;
                continue;
            }

            best.start = time;
            best.completion = time + best.burst;
            best.tat = best.completion - best.arrival;
            best.waiting = best.tat - best.burst;
            best.response = best.start - best.arrival;

            gantt.append("| ").append(best.pid).append(" ");
            timeline.append(time).append(" - ")
                    .append(best.completion).append(" : ")
                    .append(best.pid).append("\n");

            time = best.completion;

            totalWT += best.waiting;
            totalTAT += best.tat;
            totalRT += best.response;
            completed.add(best);
        }

        showSchedulingResults(
                "Priority (Non-Preemptive)", completed,
                gantt.toString(), timeline.toString(),
                totalWT, totalTAT, totalRT);
    }

    private void runRoundRobin() {
        if (model.getRowCount() == 0) {
            showError("Add at least one process first.");
            return;
        }

        String input = JOptionPane.showInputDialog(
                this, "Enter Time Quantum (positive integer):", "2");

        if (input == null) {
            return;
        }

        final int quantum;

        try {
            quantum = Integer.parseInt(input.trim());

            if (quantum <= 0) {
                showError("Time quantum must be greater than zero.");
                return;
            }
        } catch (NumberFormatException ex) {
            showError("Enter a valid whole number for time quantum.");
            return;
        }

        List<ProcessInfo> jobs = new ArrayList<>();

        for (int i = 0; i < model.getRowCount(); i++) {
            jobs.add(new ProcessInfo(
                    model.getValueAt(i, 0).toString(),
                    Integer.parseInt(model.getValueAt(i, 1).toString()),
                    Integer.parseInt(model.getValueAt(i, 2).toString()),
                    Integer.parseInt(model.getValueAt(i, 3).toString()),
                    i));
        }

        jobs.sort(Comparator
                .comparingInt((ProcessInfo p) -> p.arrival)
                .thenComparingInt(p -> p.inputOrder));

        int n = jobs.size();
        int[] remaining = new int[n];
        int[] firstStart = new int[n];
        int[] completion = new int[n];

        java.util.Arrays.fill(firstStart, -1);

        for (int i = 0; i < n; i++) {
            remaining[i] = jobs.get(i).burst;
        }

        java.util.Queue<Integer> queue = new java.util.ArrayDeque<>();

        int time = 0;
        int next = 0;
        int finished = 0;

        int totalWT = 0, totalTAT = 0, totalRT = 0;

        StringBuilder gantt = new StringBuilder("GANTT CHART\n\n");
        StringBuilder timeline = new StringBuilder();

        while (finished < n) {
            if (queue.isEmpty() && next < n && time < jobs.get(next).arrival) {
                int nextArrival = jobs.get(next).arrival;

                gantt.append("| IDLE ");
                timeline.append(time).append(" - ")
                        .append(nextArrival).append(" : IDLE\n");

                time = nextArrival;
            }

            while (next < n && jobs.get(next).arrival <= time) {
                queue.add(next);
                next++;
            }

            if (queue.isEmpty()) {
                continue;
            }

            int index = queue.remove();
            ProcessInfo p = jobs.get(index);

            if (firstStart[index] == -1) {
                firstStart[index] = time;
            }

            int start = time;
            int runTime = Math.min(quantum, remaining[index]);

            time += runTime;
            remaining[index] -= runTime;

            gantt.append("| ").append(p.pid).append(" ");
            timeline.append(start).append(" - ")
                    .append(time).append(" : ")
                    .append(p.pid).append("\n");

            // Processes arriving during this time slice join first.
            while (next < n && jobs.get(next).arrival <= time) {
                queue.add(next);
                next++;
            }

            if (remaining[index] > 0) {
                queue.add(index);
            } else {
                completion[index] = time;
                finished++;
            }
        }

        gantt.append("|");

        for (int i = 0; i < n; i++) {
            ProcessInfo p = jobs.get(i);

            p.start = firstStart[i];
            p.completion = completion[i];
            p.tat = p.completion - p.arrival;
            p.waiting = p.tat - p.burst;
            p.response = p.start - p.arrival;

            totalWT += p.waiting;
            totalTAT += p.tat;
            totalRT += p.response;
        }

        showSchedulingResults(
                "Round Robin (Quantum = " + quantum + ")",
                jobs, gantt.toString(), timeline.toString(),
                totalWT, totalTAT, totalRT);
    }

    private void showSchedulingResults(
            String algorithm,
            List<ProcessInfo> processes,
            String gantt,
            String timeline,
            int totalWT,
            int totalTAT,
            int totalRT) {

        DefaultTableModel results = new DefaultTableModel(
                new String[] { "PID", "AT", "BT", "CT", "TAT", "WT", "RT" }, 0);

        for (ProcessInfo p : processes) {
            results.addRow(new Object[] {
                    p.pid, p.arrival, p.burst,
                    p.completion, p.tat, p.waiting, p.response
            });
        }

        double n = processes.size();

        JTextArea chart = new JTextArea(
                algorithm + "\n\n" + gantt + "\n"
                        + timeline + "\n"
                        + String.format("Average Waiting Time: %.2f\n", totalWT / n)
                        + String.format("Average Turnaround Time: %.2f\n", totalTAT / n)
                        + String.format("Average Response Time: %.2f\n", totalRT / n));

        chart.setEditable(false);
        chart.setFont(new Font("Monospaced", Font.PLAIN, 13));

        JPanel output = new JPanel(new BorderLayout(8, 8));
        output.add(new JScrollPane(chart), BorderLayout.NORTH);
        output.add(new JScrollPane(new JTable(results)), BorderLayout.CENTER);
        output.setPreferredSize(new Dimension(750, 450));

        JOptionPane.showMessageDialog(
                this, output, algorithm + " Results",
                JOptionPane.INFORMATION_MESSAGE);

        for (int i = 0; i < model.getRowCount(); i++) {
            model.setValueAt("TERMINATED", i, 4);
        }

        refreshQueue();
        status.setText(algorithm + " scheduling completed.");
    }

    private void compareAlgorithms() {
        if (model.getRowCount() == 0) {
            showError("Add at least one process first.");
            return;
        }

        String quantumInput = JOptionPane.showInputDialog(
                this,
                "Enter time quantum for Round Robin:",
                "2");

        if (quantumInput == null) {
            return;
        }

        int quantum;

        try {
            quantum = Integer.parseInt(quantumInput.trim());

            if (quantum <= 0) {
                showError("Time quantum must be positive.");
                return;
            }
        } catch (NumberFormatException ex) {
            showError("Enter a valid whole number for time quantum.");
            return;
        }

        String[] algorithms = {
                "FCFS",
                "SJF",
                "SRTF",
                "Priority",
                "Round Robin"
        };

        DefaultTableModel comparison = new DefaultTableModel(
                new String[] {
                        "Algorithm", "Avg WT", "Avg TAT", "Avg RT"
                }, 0);

        for (String algorithm : algorithms) {
            List<ProcessInfo> jobs = new ArrayList<>();

            for (int i = 0; i < model.getRowCount(); i++) {
                jobs.add(new ProcessInfo(
                        model.getValueAt(i, 0).toString(),
                        Integer.parseInt(model.getValueAt(i, 1).toString()),
                        Integer.parseInt(model.getValueAt(i, 2).toString()),
                        Integer.parseInt(model.getValueAt(i, 3).toString()),
                        i));
            }

            int n = jobs.size();
            int totalWT = 0, totalTAT = 0, totalRT = 0;

            if (algorithm.equals("FCFS")) {
                jobs.sort(Comparator
                        .comparingInt((ProcessInfo p) -> p.arrival)
                        .thenComparingInt(p -> p.inputOrder));

                int time = 0;

                for (ProcessInfo p : jobs) {
                    time = Math.max(time, p.arrival);
                    p.start = time;
                    p.completion = time + p.burst;
                    time = p.completion;

                    p.tat = p.completion - p.arrival;
                    p.waiting = p.tat - p.burst;
                    p.response = p.start - p.arrival;
                }

            } else if (algorithm.equals("SJF")
                    || algorithm.equals("Priority")) {
                List<ProcessInfo> completed = new ArrayList<>();
                int time = 0;

                while (completed.size() < n) {
                    ProcessInfo best = null;

                    for (ProcessInfo p : jobs) {
                        if (!completed.contains(p) && p.arrival <= time) {
                            boolean better;

                            if (best == null) {
                                better = true;
                            } else if (algorithm.equals("SJF")) {
                                better = p.burst < best.burst
                                        || (p.burst == best.burst
                                                && p.arrival < best.arrival)
                                        || (p.burst == best.burst
                                                && p.arrival == best.arrival
                                                && p.inputOrder < best.inputOrder);
                            } else {
                                better = p.priority < best.priority
                                        || (p.priority == best.priority
                                                && p.arrival < best.arrival)
                                        || (p.priority == best.priority
                                                && p.arrival == best.arrival
                                                && p.inputOrder < best.inputOrder);
                            }

                            if (better) {
                                best = p;
                            }
                        }
                    }

                    if (best == null) {
                        int nextArrival = Integer.MAX_VALUE;

                        for (ProcessInfo p : jobs) {
                            if (!completed.contains(p)) {
                                nextArrival = Math.min(nextArrival, p.arrival);
                            }
                        }

                        time = nextArrival;
                        continue;
                    }

                    best.start = time;
                    best.completion = time + best.burst;
                    time = best.completion;

                    best.tat = best.completion - best.arrival;
                    best.waiting = best.tat - best.burst;
                    best.response = best.start - best.arrival;

                    completed.add(best);
                }

            } else {
                int[] remaining = new int[n];
                int[] firstStart = new int[n];
                int[] finish = new int[n];

                java.util.Arrays.fill(firstStart, -1);

                for (int i = 0; i < n; i++) {
                    remaining[i] = jobs.get(i).burst;
                }

                int time = 0;
                int finished = 0;

                if (algorithm.equals("SRTF")) {
                    while (finished < n) {
                        int best = -1;

                        for (int i = 0; i < n; i++) {
                            ProcessInfo p = jobs.get(i);

                            if (remaining[i] > 0 && p.arrival <= time) {
                                if (best == -1
                                        || remaining[i] < remaining[best]
                                        || (remaining[i] == remaining[best]
                                                && p.arrival < jobs.get(best).arrival)
                                        || (remaining[i] == remaining[best]
                                                && p.arrival == jobs.get(best).arrival
                                                && p.inputOrder < jobs.get(best).inputOrder)) {
                                    best = i;
                                }
                            }
                        }

                        if (best == -1) {
                            time++;
                            continue;
                        }

                        if (firstStart[best] == -1) {
                            firstStart[best] = time;
                        }

                        remaining[best]--;
                        time++;

                        if (remaining[best] == 0) {
                            finish[best] = time;
                            finished++;
                        }
                    }

                } else {
                    jobs.sort(Comparator
                            .comparingInt((ProcessInfo p) -> p.arrival)
                            .thenComparingInt(p -> p.inputOrder));

                    java.util.Queue<Integer> queue = new java.util.ArrayDeque<>();

                    int next = 0;
                    time = 0;

                    while (finished < n) {
                        if (queue.isEmpty() && next < n
                                && time < jobs.get(next).arrival) {
                            time = jobs.get(next).arrival;
                        }

                        while (next < n && jobs.get(next).arrival <= time) {
                            queue.add(next++);
                        }

                        if (queue.isEmpty()) {
                            continue;
                        }

                        int index = queue.remove();

                        if (firstStart[index] == -1) {
                            firstStart[index] = time;
                        }

                        int run = Math.min(quantum, remaining[index]);
                        time += run;
                        remaining[index] -= run;

                        while (next < n && jobs.get(next).arrival <= time) {
                            queue.add(next++);
                        }

                        if (remaining[index] > 0) {
                            queue.add(index);
                        } else {
                            finish[index] = time;
                            finished++;
                        }
                    }
                }

                for (int i = 0; i < n; i++) {
                    ProcessInfo p = jobs.get(i);
                    p.start = firstStart[i];
                    p.completion = finish[i];
                    p.tat = p.completion - p.arrival;
                    p.waiting = p.tat - p.burst;
                    p.response = p.start - p.arrival;
                }
            }

            for (ProcessInfo p : jobs) {
                totalWT += p.waiting;
                totalTAT += p.tat;
                totalRT += p.response;
            }

            comparison.addRow(new Object[] {
                    algorithm,
                    String.format("%.2f", totalWT / (double) n),
                    String.format("%.2f", totalTAT / (double) n),
                    String.format("%.2f", totalRT / (double) n)
            });
        }

        JTable table = new JTable(comparison);
        table.setRowHeight(25);

        JOptionPane.showMessageDialog(
                this,
                new JScrollPane(table),
                "CPU Scheduling Performance Comparison",
                JOptionPane.INFORMATION_MESSAGE);

        status.setText("Algorithm comparison completed.");
    }

    private static class ProcessInfo {
        String pid;
        int arrival, burst, priority, inputOrder;
        int start, completion, tat, waiting, response;

        ProcessInfo(String pid, int arrival, int burst,
                int priority, int inputOrder) {
            this.pid = pid;
            this.arrival = arrival;
            this.burst = burst;
            this.priority = priority;
            this.inputOrder = inputOrder;
        }
    }

    private void showError(String message) {
        JOptionPane.showMessageDialog(
                this, message, "Input Error",
                JOptionPane.ERROR_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            OSProcessSchedulingSimulator app = new OSProcessSchedulingSimulator();
            app.setVisible(true);
        });
    }
}
