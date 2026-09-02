window.Intermediate2TechnologyFunctions = {
  audioRoot: "audio/unit-3-technology-functions/",
  devices: [
    ["smartphone", "Smartphone", "make calls, use apps, and take photos", "turn it on, then open the app you need"],
    ["laptop", "Laptop", "create documents, browse the internet, and join video calls", "turn it on, then sign in to your account"],
    ["tablet", "Tablet", "read, watch videos, and take notes", "unlock the screen, then choose the app you need"],
    ["printer", "Printer", "print documents and photos", "load the paper, then choose Print on your device"],
    ["router", "Router", "connect devices to the internet", "plug it in, then connect it to the modem"],
    ["smart-speaker", "Smart speaker", "play music, answer questions, and control connected devices", "plug it in, then connect it to Wi-Fi"],
    ["microwave", "Microwave", "heat food quickly", "put the food inside, then set the time and press Start"],
    ["blender", "Blender", "mix food and make drinks", "add the ingredients, then close the lid and press Start"],
    ["washing-machine", "Washing machine", "wash clothes", "add the clothes and detergent, then choose a cycle and press Start"],
    ["refrigerator", "Refrigerator", "keep food cold and fresh", "open the door, then place the food on a shelf"],
    ["vacuum-cleaner", "Vacuum cleaner", "clean floors and carpets", "plug it in, then turn it on and move it slowly"],
    ["air-conditioner", "Air conditioner", "cool a room", "turn it on, then choose a temperature"]
  ].map(([id, label, functionText, instruction]) => ({
    id, label, functionText, instruction,
    image: `../../assets/img/english-intermediate-2/unit-3/technology-functions-device-roulette/${id}-v1.png`,
    wordAudio: `${id}-word.mp3`, modelAudio: `${id}-model.mp3`
  }))
};
