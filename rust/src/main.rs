use std::env;
use std::io::{self, Read};

const COMMON: [(&str, &str); 5] = [
    ("Problem & urgency", "What specific, frequent, costly problem is solved, and what evidence shows it is urgent?"),
    ("Buyer & demand", "Who uses it, who controls the budget, and what observed behavior signals adoption or willingness to pay?"),
    ("Alternatives", "What competitors, substitutes, workarounds, or do-nothing options already exist?"),
    ("Feasibility & dependencies", "What people, permissions, integrations, infrastructure, and partners are essential?"),
    ("Smallest test", "What low-cost, reversible experiment could disprove the central assumption before major investment?"),
];

fn mode_questions(mode: &str) -> Option<(&'static str, &'static str, &'static str)> {
    match mode {
        "devil" => Some(("DEVIL MODE", "What is the strongest plausible reason users reject this, and what would make switching not worthwhile?", "Which assumption would cause the greatest damage if false?")),
        "investor" => Some(("INVESTOR MODE", "What are setup costs, monthly burn, runway, margin, acquisition cost, retention, and break-even assumptions? What is measured versus guessed?", "What evidence supports a reachable initial market rather than a top-down TAM headline?")),
        "cto" => Some(("CTO MODE", "What is the smallest reliable architecture, including data boundaries, security, backups, observability, capacity, and vendor failure modes?", "For each component, should you build, buy, outsource, or defer it? What is the maintenance burden?")),
        "auditor" => Some(("AUDITOR MODE", "Which claims are unsupported, permissions or obligations missing, sensitive data exposed, or conflicts unexamined?", "What could fail legally, financially, operationally, or reputationally, and who owns mitigation?")),
        "execution" => Some(("EXECUTION MODE", "What is the next milestone, owner, deliverable, budget, deadline, dependency, and measurable go/no-go gate?", "Can the riskiest assumption be validated with a smaller, reversible experiment?")),
        _ => None,
    }
}

fn main() {
    let mut args = env::args().skip(1);
    let mut mode = String::from("devil");
    let mut idea: Option<String> = None;
    let mut json = false;
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--mode" => match args.next() { Some(value) => mode = value, None => usage("--mode needs a value") },
            "--idea" => match args.next() { Some(value) => idea = Some(value), None => usage("--idea needs a value") },
            "--format" => match args.next().as_deref() { Some("json") => json = true, Some("text") => {}, _ => usage("--format must be text or json") },
            "-h" | "--help" => { println!("Usage: realityforge [--mode devil|investor|cto|auditor|execution] [--idea TEXT] [--format text|json]\nIf --idea is omitted, proposal text is read from stdin."); return; },
            _ => usage("unknown argument"),
        }
    }
    let Some((label, first, second)) = mode_questions(&mode) else { usage("unknown mode") };
    let proposal = match idea { Some(text) => text, None => { let mut text = String::new(); if io::stdin().read_to_string(&mut text).is_err() { usage("could not read stdin") }; text } };
    if proposal.trim().is_empty() { usage("provide --idea or pipe proposal text on stdin"); }
    if json { print_json(label, proposal.trim(), first, second); }
    else { print_text(label, proposal.trim(), first, second); }
}

fn usage(message: &str) -> ! { eprintln!("Error: {message}\nUse --help for usage."); std::process::exit(2) }
fn print_text(label: &str, proposal: &str, first: &str, second: &str) {
    println!("{label} — REALITYFORGE\n\nPROPOSAL\n{proposal}\n");
    for (index, (topic, question)) in COMMON.iter().enumerate() { println!("{:02}. {topic}\n    {question}\n    Evidence / answer: [not answered]\n", index + 1); }
    println!("06. Mode-specific challenge\n    {first}\n    Evidence / answer: [not answered]\n\n07. Second challenge\n    {second}\n    Evidence / answer: [not answered]\n\nCURRENT DECISION: VALIDATE FIRST\nNEXT TEST: [not specified]\n\nChecklist only; this tool does not verify claims, estimate viability, or provide professional advice.");
}

// Keep JSON output valid without pulling in a serialization dependency.
fn quote(value: &str) -> String {
    let mut out = String::from("\"");
    for ch in value.chars() {
        match ch { '"' => out.push_str("\\\""), '\\' => out.push_str("\\\\"), '\n' => out.push_str("\\n"), '\r' => out.push_str("\\r"), '\t' => out.push_str("\\t"), c if c < '\u{20}' => out.push_str(&format!("\\u{:04x}", c as u32)), c => out.push(c) }
    }
    out.push('"'); out
}
fn print_json(label: &str, proposal: &str, first: &str, second: &str) {
    let questions: Vec<(&str, &str)> = COMMON.iter().copied().chain([("Mode-specific challenge", first), ("Second challenge", second)]).collect();
    println!("{{\n  \"product\": \"REALITYFORGE\",\n  \"mode\": {},\n  \"proposal\": {},\n  \"warning\": \"Checklist only; this tool does not verify claims, estimate viability, or provide professional advice.\",\n  \"questions\": [", quote(label), quote(proposal));
    for (index, (topic, question)) in questions.iter().enumerate() {
        let comma = if index + 1 == questions.len() { "" } else { "," };
        println!("    {{\"topic\": {}, \"question\": {}, \"evidence\": null}}{comma}", quote(topic), quote(question));
    }
    println!("  ],\n  \"current_decision\": \"VALIDATE FIRST\",\n  \"next_test\": null\n}}");
}
