import json
import random

def generate_astronomy_mcq(i):
    q_list = [
        "What type of star is the Sun?",
        "Which planet has the most moons?",
        "What is the largest planet in our solar system?",
        "What is the Kuiper Belt?",
        "Which planet is known as the Red Planet?",
        "What is the closest star to Earth besides the Sun?",
        "What causes a solar eclipse?",
        "What is a neutron star?"
    ]
    options_list = [
        ["Red Dwarf", "White Dwarf", "Main Sequence", "Neutron Star"],
        ["Earth", "Mars", "Jupiter", "Saturn"],
        ["Earth", "Jupiter", "Neptune", "Saturn"],
        ["A type of galaxy", "A ring of asteroids around Jupiter", "A region beyond Neptune with icy bodies", "A belt of gas around Earth"],
        ["Venus", "Mars", "Jupiter", "Saturn"],
        ["Alpha Centauri", "Proxima Centauri", "Sirius", "Betelgeuse"],
        ["Moon passing between Earth and Sun", "Earth's shadow on the Moon", "Sunspots blocking sunlight", "Solar flares"],
        ["A dense remnant of a supernova", "A type of comet", "A gas giant", "A black hole"]
    ]
    answer_list = [2, 3, 1, 2, 1, 1, 0, 0]

    idx = i % len(q_list)
    return {
        "q": q_list[idx] + f" (Q{i+1})",
        "options": options_list[idx],
        "answer": answer_list[idx]
    }

def generate_astronomy_frq(i):
    q_list = [
        "Explain the life cycle of a medium-mass star.",
        "Describe how black holes are detected.",
        "Explain what causes a solar eclipse.",
        "What is a neutron star and how does it form?"
    ]
    answer_list = [
        "A medium-mass star forms from a nebula, becomes a main sequence star, expands into a red giant, then sheds its outer layers and ends as a white dwarf.",
        "Black holes are detected by observing their effects on nearby matter and gravitational lensing, such as x-ray emissions from accretion disks.",
        "A solar eclipse occurs when the Moon passes between the Earth and the Sun, blocking the Sun's light.",
        "A neutron star is a dense remnant of a supernova, formed when a massive star's core collapses."
    ]
    idx = i % len(q_list)
    return {
        "q": q_list[idx] + f" (FRQ{i+1})",
        "answer": answer_list[idx]
    }

def generate_anatomy_mcq(i):
    q_list = [
        "What is the largest organ in the human body?",
        "What type of muscle is found in the heart?",
        "Where does gas exchange occur in the lungs?",
        "What is the main function of red blood cells?",
        "Which organ is responsible for filtering blood?"
    ]
    options_list = [
        ["Liver", "Skin", "Lungs", "Heart"],
        ["Skeletal", "Cardiac", "Smooth", "Voluntary"],
        ["Bronchi", "Alveoli", "Trachea", "Pleura"],
        ["Carry oxygen", "Fight infection", "Produce hormones", "Store fat"],
        ["Kidney", "Liver", "Heart", "Lungs"]
    ]
    answer_list = [1, 1, 1, 0, 0]

    idx = i % len(q_list)
    return {
        "q": q_list[idx] + f" (Q{i+1})",
        "options": options_list[idx],
        "answer": answer_list[idx]
    }

def generate_anatomy_frq(i):
    q_list = [
        "Describe the function of the digestive system.",
        "Explain how oxygen is transported in the blood.",
        "Outline the structure of the nephron in the kidney.",
        "What is the role of the hypothalamus?",
        "Explain the function of the lymphatic system."
    ]
    answer_list = [
        "The digestive system breaks down food, absorbs nutrients, and eliminates waste.",
        "Oxygen is transported by binding to hemoglobin in red blood cells.",
        "The nephron filters blood, reabsorbs needed substances, and excretes waste as urine.",
        "The hypothalamus regulates body temperature, hunger, thirst, and hormonal balance.",
        "The lymphatic system returns fluids to the bloodstream and helps fight infections."
    ]
    idx = i % len(q_list)
    return {
        "q": q_list[idx] + f" (FRQ{i+1})",
        "answer": answer_list[idx]
    }

# Generate 1000 questions total (500 Astronomy, 500 Anatomy)
astronomy_mcq = []
astronomy_frq = []
anatomy_mcq = []
anatomy_frq = []

for i in range(500):
    astronomy_mcq.append(generate_astronomy_mcq(i))
    astronomy_frq.append(generate_astronomy_frq(i))
    anatomy_mcq.append(generate_anatomy_mcq(i))
    anatomy_frq.append(generate_anatomy_frq(i))

questions = {
    "Astronomy": {
        "mcq": astronomy_mcq,
        "frq": astronomy_frq
    },
    "Anatomy": {
        "mcq": anatomy_mcq,
        "frq": anatomy_frq
    }
}

# Save to JSON file
with open("large_questions.json", "w") as f:
    json.dump(questions, f, indent=2)
