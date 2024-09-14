export class SR5_ConverterHelpers {

    //Convert firing mode choice to  number of bullets
    static firingModeToBullet(mode){
        switch(mode){
            case "SS":
            case "SA":
                return 1;
            case "SB":
            case "BF":
                return 3;
            case "LB":
            case "FA":
                return 6;
            case "FAc":
                return 10;
            case "SF":
                return 20;
            default: return 0;
        }
    }

    //Convert firing mode choice to  number of bullets
    static firingModeToDefenseMod(mode){
        switch(mode){
            case "SS":
            case "SA":
                return 0;
            case "SB":
            case "BF":
                return -2;
            case "LB":
            case "FA":
                return -5;
            case "FAc":
                return -9;
            case "SF":
                return 0;
            default: return 0;
        }
    }

    //Conver firing mode choice to action type
    static firingModeToAction(mode){
        switch(mode){
            case "SS":
            case "SA":
            case "BF":
            case "FA":
                return {type: "simple", value: 1, source: "attack"};
            case "SB":
            case "LB":
            case "FAc":
            case "SF":
                return {type: "complex", value: 1, source: "attack"};
            default: 
        }
    }      

    //Convert range  to environmental line
    static rangeToEnvironmentalLine(mode){
        switch(mode){
            case "short":
                return 0;
            case "medium":
                return 1;
            case "long":
                return 2;
            case "extreme":
                return 3;
            default: return 0;
        }
    }

    //Convert active defense mode to dice mod value
    static activeDefenseToMod(defenseMode, defenseValue){
        switch(defenseMode){
            case "dodge": 
                return defenseValue.dodge;
            case "block":
                return defenseValue.block;
            case "parryClubs":
                return defenseValue.parryClubs;
            case "parryBlades":
                return defenseValue.parryBlades;
            default: 
                return 0;
        }
    }

    //Convert active defense mode to initiative modifier value
    static activeDefenseToInitMod(defenseMode){
        switch(defenseMode){
            case "dodge": 
            case "block":
            case "parryClubs":
            case "parryBlades":
                return -5;
            default: 
                return 0;
        }
    }

    //convert matrix distance to dice mod
    static matrixDistanceToMod(distance){
        switch (distance){
            case "wired":
            case "upTo100m":
                return 0;
            case "upTo1km":
                return -1;
            case "upTo10km":
                return -3;
            case "upTo100km":
                return -5;
            case "farAway":
                return -8;
        }
    }

    //convert matrix search info to interval multiplier for an extended test
    static matrixSearchTypeToTime(type){
        switch (type){
            case "general":
                return 1;
            case "limited":
                return 30;
            case "hidden":
                return 12;
            default: return 1;
        }
    }

    //convert matrix search info to interval multiplier for an extended test
    static matrixSearchTypeToUnitTime(type){
        switch (type){
            case "general":
            case "limited":
                return "minute";
            case "hidden":
                return "hour";
            default: return "minute";
        }
    }

    //Convert environmental modifier to dice pool modifier
    static environmentalLineToMod(modifier){
        switch (modifier){
            case 0:
                return 0;
            case 1:
                return -1;
            case 2:
                return -3;
            case 3:
                return -6;
            case 4:
                return -10;
            default:
                return 0;
        }
    }

    //Get signature modifier
    static signatureToMod(signature){
        switch (signature){
            case "vehicleLarge":
                return 3;
            case "vehicleElectric":
                return -3;
            case "metahuman":
                return -3;
            case "drone":
                return -3;
            case "droneMicro":
                return -6;
            default:
                return 0;
        }
    }

    static healingConditionToMod(condition){
        switch (condition){
            case "good":
                return 0;
            case "average":
                return -1;
            case "poor":
                return -2;
            case "bad":
                return -3;
            case "terrible":
                return -4;
            default: return 0;
        }
    }

    static restraintTypeToThreshold(type){
        switch (type){
            case "rope":
                return 2;
            case "metal":
                return 3;
            case "straitjacket":
                return 4;
            case "containment":
                return 5;
            default: return 2;
        }
    }

    static perceptionTypeToThreshold(type){
        switch (type){
            case "opposed":
                return 0;
            case "obvious":
                return 1;
            case "normal":
                return 2;
            case "obscured":
                return 3;
            case "hidden":
                return 4;
            default: return 0;
        }
    }

    static weatherConditionToMod(type){
        switch (type){
            case "poor":
                return -1;
            case "terrible":
                return -2;
            case "extreme":
                return -4;
            default: return 0;
        }
    }

    static survivalTypeToThreshold(type){
        switch (type){
            case "mild":
                return 1;
            case "moderate":
                return 2;
            case "tough":
                return 3;
            case "extreme":
                return 4;
            default: return 0;
        }
    }

    static socialAttitudeToMod(type){
        switch (type){
            case "friendly":
                return 2;
            case "neutral":
                return 0;
            case "suspicious":
                return -1;
            case "prejudiced":
                return -2;
            case "hostile":
                return -3;
            case "enemy":
                return -4;
            default: return 0;
        }
    }

    static socialResultToMod(type){
        switch (type){
            case "advantageous":
                return 1;
            case "ofNoValue":
                return 0;
            case "annoying":
                return -1;
            case "harmful":
                return -3;
            case "disastrous":
                return -4;
            default: return 0;
        }
    }

    static workingConditionToMod(type){
        switch (type){
            case "distracting":
                return -1;
            case "poor":
                return -2;
            case "bad":
                return -3;
            case "terrible":
                return -4;
            case "superior":
                return 1;
            default: return 0;
        }
    }

    static toolsAndPartsToMod(type){
        switch (type){
            case "inadequate":
                return -2;
            case "unavailable":
                return -4;
            case "superior":
                return 1;
            default: return 0;
        }
    }

    static plansMaterialToMod(type){
        switch (type){
            case "available":
                return 1;
            case "augmented":
                return 2;
            default: return 0;
        }
    }

    static coverToMod(type){
        switch (type){
            case "none":
                return 0;
            case "partial":
                return 2;
            case "full":
                return 4;
            default: return 0;
        }
    }

    static markToMod(type){
        switch (type){
            case "1":
                return 0;
            case "2":
                return -4;
            case "3":
                return -10;
            default: return 0;
        }
    }

    static triggerToMod(type){
        switch (type){
            case "command":
            case "time":
                return 2;
            case "contact":
                return 1;
            default: return 0;
        }
    }

    static searchTypeToThreshold(type){
        switch (type){
            case "general":
                return 1;
            case "limited":
                return 3;
            case "hidden":
                return 6;
            default: return 0;
        }
    }

    static speedToDamageValue(speed, body){
        switch(speed) {
            case "speedRamming1":
                return Math.ceil(body/2);
            case "speedRamming11":
                return body;
            case "speedRamming51":
                return body*2;
            case "speedRamming201":
                return body*3;
            case "speedRamming301":
                return body*5;
            case "speedRamming501":
                return body*10;
            default:
        }
    }

    static speedToAccidentValue(speed, body){
        switch(speed) {
            case "speedRamming1":
                return Math.ceil(body/4);
            case "speedRamming11":
                return Math.ceil(body/2);
            case "speedRamming51":
                return body;
            case "speedRamming201":
                return Math.ceil((body*3)/2);
            case "speedRamming301":
                return Math.ceil(body*2,5);
            case "speedRamming501":
                return Math.ceil(body*5);
            default:
        }
    }

    static barrierTypeToStructure(barrierType){
        switch(barrierType){
            case "fragile":
                return 1
            case "cheap":
                return 2
            case "average":
                return 4
            case "heavy":
                return 6
            case "reinforced":
                return 8
            case "structural":
                return 10
            case "structuralHeavy":
                return 12
            case "armored":
                return 14
            case "hardened":
                return 16
            default: return 6
        }
    }

    static barrierTypeToArmor(barrierType){
        switch(barrierType){
            case "fragile":
                return 2
            case "cheap":
                return 4
            case "average":
                return 6
            case "heavy":
                return 8
            case "reinforced":
                return 12
            case "structural":
                return 16
            case "structuralHeavy":
                return 20
            case "armored":
                return 24
            case "hardened":
                return 32
            default: return 8
        }
    }
}