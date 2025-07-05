

import sys
import os




if __name__ == "__main__":

    os.system("rm out.txt")
    bot1: str
    bot2: str
    if len(sys.argv)==3:
        bot1 = sys.argv[1]
        bot2 = sys.argv[2]
    else:
        bot1 = "smartBotMk3.js"
        bot2 = "smartBotMk4.js"
    command = f"node dynamite-cli.js {bot1} {bot2} >> out.txt"
    for i in range(200):
        os.system(command)
    

    with open("out.txt", "r") as f:
        text = f.read()
        lines = text.split("\n")
        total_diff=0
        c=0
        for line in lines:
            if line.startswith("Score"):
                c+=1
                total_diff += eval (line[7:])

        
        print("avg difference", total_diff/c)
        print(bot1, text.count("p1"))
        print(bot2, text.count("p2"))

