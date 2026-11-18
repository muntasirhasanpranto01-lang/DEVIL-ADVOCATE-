#!/usr/bin/env python3
"""REALITYFORGE checklist CLI. Heuristic prompts only; no AI or external research."""
import argparse
import json
import sys

COMMON = [
    ("Problem & urgency", "What specific, frequent, costly problem is solved, and what evidence shows it is urgent?"),
    ("Buyer & demand", "Who uses it, who controls the budget, and what observed behavior signals adoption or willingness to pay?"),
    ("Alternatives", "What competitors, substitutes, workarounds, or do-nothing options already exist?"),
    ("Feasibility & dependencies", "What people, permissions, integrations, infrastructure, and partners are essential?"),
    ("Smallest test", "What low-cost, reversible experiment could disprove the central assumption before major investment?"),
]
MODES = {
    "devil": ("DEVIL MODE", "What is the strongest plausible reason users reject this, and what would make switching not worthwhile?", "Which assumption would cause the greatest damage if false?"),
    "investor": ("INVESTOR MODE", "What are setup costs, monthly burn, runway, margin, acquisition cost, retention, and break-even assumptions? What is measured versus guessed?", "What evidence supports a reachable initial market rather than a top-down TAM headline?"),
    "cto": ("CTO MODE", "What is the smallest reliable architecture, including data boundaries, security, backups, observability, capacity, and vendor failure modes?", "For each component, should you build, buy, outsource, or defer it? What is the maintenance burden?"),
    "auditor": ("AUDITOR MODE", "Which claims are unsupported, permissions or obligations missing, sensitive data exposed, or conflicts unexamined?", "What could fail legally, financially, operationally, or reputationally, and who owns mitigation?"),
    "execution": ("EXECUTION MODE", "What is the next milestone, owner, deliverable, budget, deadline, dependency, and measurable go/no-go gate?", "Can the riskiest assumption be validated with a smaller, reversible experiment?"),
}


def review(idea, mode):
    label, first, second = MODES[mode]
    questions = COMMON + [("Mode-specific challenge", first), ("Second challenge", second)]
    return {"product": "REALITYFORGE", "mode": label, "proposal": idea.strip(), "warning": "Checklist only; this tool does not verify claims, estimate viability, or provide professional advice.", "questions": [{"topic": topic, "question": question, "evidence": None} for topic, question in questions], "current_decision": "VALIDATE FIRST", "next_test": None}


def main():
    parser = argparse.ArgumentParser(description="Generate a transparent REALITYFORGE review checklist.")
    parser.add_argument("--mode", choices=MODES, default="devil")
    parser.add_argument("--idea", help="Proposal text; if omitted, read stdin.")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args()
    idea = args.idea if args.idea is not None else sys.stdin.read()
    if not idea.strip():
        parser.error("provide --idea or pipe proposal text on stdin")
    result = review(idea, args.mode)
    if args.format == "json":
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"{result['mode']} — REALITYFORGE\n\nPROPOSAL\n{result['proposal']}\n")
        for number, item in enumerate(result["questions"], 1):
            print(f"{number:02d}. {item['topic']}\n    {item['question']}\n    Evidence / answer: [not answered]\n")
        print(f"CURRENT DECISION: {result['current_decision']}\nNEXT TEST: [not specified]\n\n{result['warning']}")


if __name__ == "__main__":
    main()
