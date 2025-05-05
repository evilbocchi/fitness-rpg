DROP TABLE IF EXISTS BattleRequest;

DROP TABLE IF EXISTS FitnessChallengeReview;

DROP TABLE IF EXISTS UserCompletion;

DROP TABLE IF EXISTS FitnessChallenge;

DROP TABLE IF EXISTS ItemOwnership;

DROP TABLE IF EXISTS SkillOwnership;

DROP TABLE IF EXISTS BattleEffect;

DROP TABLE IF EXISTS Effect;

DROP TABLE IF EXISTS Battle;

DROP TABLE IF EXISTS UserCharacter;

DROP TABLE IF EXISTS User;

DROP TABLE IF EXISTS Skill;

DROP TABLE IF EXISTS Item;

DROP TABLE IF EXISTS Dungeon;

DROP TABLE IF EXISTS Monster;

CREATE TABLE
    User (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username TEXT NOT NULL,
        email VARCHAR(320) NOT NULL,
        password TEXT NOT NULL,
        /* type is free to change for different hashing algorithms */ skillpoints INT DEFAULT 0
    );

CREATE TABLE
    FitnessChallenge (
        challenge_id INT AUTO_INCREMENT PRIMARY KEY,
        creator_id INT NOT NULL,
        challenge TEXT NOT NULL,
        skillpoints INT NOT NULL,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES User (user_id)
    );

CREATE TABLE
    FitnessChallengeReview (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        challenge_id INT NOT NULL,
        rating INT NOT NULL,
        user_id INT NOT NULL,
        description VARCHAR(400) NOT NULL,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User (user_id),
        FOREIGN KEY (challenge_id) REFERENCES FitnessChallenge (challenge_id) ON DELETE CASCADE
    );

CREATE TABLE
    UserCompletion (
        complete_id INT AUTO_INCREMENT PRIMARY KEY,
        challenge_id INT NOT NULL,
        user_id INT NOT NULL,
        completed BOOL NOT NULL,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES User (user_id),
        FOREIGN KEY (challenge_id) REFERENCES FitnessChallenge (challenge_id) ON DELETE CASCADE
    );

CREATE TABLE
    UserCharacter (
        character_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(30) NOT NULL,
        mana INT DEFAULT 50,
        health INT DEFAULT 100,
        exp INT DEFAULT 0,
        element ENUM ('Fire', 'Water', 'Earth', 'Air', 'Light', 'Darkness') NOT NULL,
        FOREIGN KEY (user_id) REFERENCES User (user_id)
    );

CREATE TABLE
    Monster (
        monster_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        health INT DEFAULT 100,
        level INT DEFAULT 1,
        power INT DEFAULT 0,
        element ENUM ('Fire', 'Water', 'Earth', 'Air', 'Light', 'Darkness') NOT NULL
    );

CREATE TABLE
    Skill (
        skill_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(64) NOT NULL,
        description VARCHAR(400) NOT NULL,
        skillpoint_purchase_cost INT NOT NULL,
        element ENUM ('Fire', 'Water', 'Earth', 'Air', 'Light', 'Darkness') NOT NULL,
        accuracy INT NOT NULL,
        damage INT NOT NULL,
        mana_cost INT NOT NULL
    );

CREATE TABLE
    SkillOwnership (
        ownership_id INT PRIMARY KEY AUTO_INCREMENT,
        character_id INT NOT NULL,
        skill_id INT NOT NULL,
        FOREIGN KEY (character_id) REFERENCES UserCharacter (character_id),
        FOREIGN KEY (skill_id) REFERENCES Skill (skill_id)
    );

CREATE TABLE
    Effect (
        effect_id INT PRIMARY KEY AUTO_INCREMENT,
        skill_id INT NOT NULL,
        effect_type ENUM ('Health', 'Mana Cost', 'Incoming Damage', 'Outgoing Damage', 'Accuracy') NOT NULL,
        effect_value INT,
        duration INT DEFAULT 0,
        effect_target ENUM ('Self', 'Opponent') NOT NULL,
        FOREIGN KEY (skill_id) REFERENCES Skill (skill_id)
    );

CREATE TABLE
    Battle (
        battle_id INT PRIMARY KEY AUTO_INCREMENT,
        attacker_id INT NOT NULL,
        defender_id INT,
        monster_id INT, -- NULL if PvP
        monster_health INT, -- NULL if PvP
        turns INT DEFAULT 0,
        winner INT,
        finished BOOLEAN DEFAULT FALSE,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_result TEXT,
        last_effect_result TEXT,
        FOREIGN KEY (attacker_id) REFERENCES UserCharacter (character_id),
        FOREIGN KEY (defender_id) REFERENCES UserCharacter (character_id)
    );

CREATE TABLE
    BattleEffect (
        battleeffect_id INT PRIMARY KEY AUTO_INCREMENT,
        battle_id INT NOT NULL,
        effect_id INT NOT NULL,
        target ENUM ('Attacker', 'Defender') NOT NULL,
        turns INT NOT NULL,
        FOREIGN KEY (battle_id) REFERENCES Battle (battle_id) ON DELETE CASCADE,
        FOREIGN KEY (effect_id) REFERENCES Effect (effect_id) ON DELETE CASCADE
    );

CREATE TABLE
    BattleRequest (
        request_id INT PRIMARY KEY AUTO_INCREMENT,
        requester_id INT NOT NULL, -- requester is a character
        user_id INT NOT NULL, -- requested user
        FOREIGN KEY (requester_id) REFERENCES UserCharacter (character_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES User (user_id) ON DELETE CASCADE
    );

CREATE TABLE
    Item (
        item_id INT PRIMARY KEY AUTO_INCREMENT,
        name TEXT NOT NULL,
        power INT NOT NULL,
        req INT NOT NULL,
        slot ENUM ('Helmet', 'Chestplate', 'Leggings', 'Boots', 'Weapon', 'Potion') NOT NULL,
        effect_type ENUM ('Health'),
        element ENUM ('Fire', 'Water', 'Earth', 'Air', 'Light', 'Darkness'),
        rarity ENUM ('Common', 'Rare', 'Epic', 'Legendary') NOT NULL,
        special BOOLEAN DEFAULT FALSE -- excludes item from loot tables
    );

CREATE TABLE
    ItemOwnership (
        ownership_id INT PRIMARY KEY AUTO_INCREMENT,
        character_id INT NOT NULL,
        item_id INT NOT NULL,
        equipped ENUM ('Helmet', 'Chestplate', 'Leggings', 'Boots', 'Weapon', 'Potion'),
        FOREIGN KEY (character_id) REFERENCES UserCharacter (character_id),
        FOREIGN KEY (item_id) REFERENCES Item (item_id)
    );

CREATE TABLE
    Dungeon (dungeon_id INT PRIMARY KEY AUTO_INCREMENT, name TEXT NOT NULL, req INT NOT NULL);

INSERT INTO
    Skill (name, description, skillpoint_purchase_cost, element, accuracy, damage, mana_cost)
VALUES
    -- Fire Skills
    ('Fireball', 'Summon a fire to throw at your opponent from a distance!', 50, 'Fire', 90, 10, 5),
    ('Flame Slash', 'Slash your opponent with a powerful flame.', 70, 'Fire', 95, 24, 10),
    ('Explosion', 'Blow your opponent away!', 150, 'Fire', 100, 30, 25),
    ('Disintegration', 'Turn your opponents into bits and pieces with a devastating move!', 400, 'Fire', 75, 35, 60),
    -- Water Skills
    ('Water Beam', 'Shoot a strong beam of water at your opponent!', 50, 'Water', 95, 10, 5),
    ('Hydration', 'Damage your opponent with a concentrated spike of water while healing yourself at half your damage!', 70, 'Water', 90, 18, 10),
    ('Tidal Wave', 'Unleash a powerful wave, weakening your opponent for 1 turn.', 120, 'Water', 85, 22, 15),
    ('Aqua Shield', 'Heals a massive amount of health at the expense of mana.', 300, 'Water', 100, 0, 70),
    -- Earth Skills
    ('Rock Throw', 'Hurl a sharp rock at your opponent.', 40, 'Earth', 95, 8, 4),
    ('Earthquake', 'Shake the ground and deal massive damage to your opponent.', 180, 'Earth', 95, 28, 20),
    ('Stone Skin', 'Harden your skin, temporarily reducing incoming damage by 20%.', 90, 'Earth', 100, 0, 10),
    ('Boulder Crush', 'Summon a boulder to slam down on your opponent, dealing heavy damage.', 140, 'Earth', 100, 26, 15),
    -- Air Skills
    ('Gust', 'Create a burst of wind to knock back your opponent.', 30, 'Air', 100, 6, 4),
    ('Whirlwind', 'Trap your opponent in a small tornado, dealing damage over time.', 90, 'Air', 85, 16, 10),
    ('Cyclone', 'Unleash a powerful windstorm that damages opponents.', 200, 'Air', 70, 28, 30),
    ('Featherlight', 'Your body feels light, increasing your damage by 50% for 3 turns.', 300, 'Air', 100, 0, 35),
    -- Light Skills
    ('Healing Light', 'Channel light energy to restore a moderate amount of health.', 80, 'Light', 100, 0, 10),
    ('Divine Strike', 'Strike your opponent with a beam of light energy.', 120, 'Light', 20, 22, 15),
    ('Radiant Shield', 'Summon a shield of light to block one incoming attack.', 90, 'Light', 100, 0, 10),
    ('Blinding Flash', 'Emit a flash of blinding light, temporarily reducing the accuracy of your opponent.', 100, 'Light', 10, 0, 8),
    -- Darkness Skills
    ('Shadow Sneak', 'Merge with the shadows to strike from a distance.', 50, 'Darkness', 100, 12, 8),
    ('Nightmare', 'Invade the mind of your opponent, dealing damage and lowering their defenses.', 140, 'Darkness', 100, 24, 20),
    ('Soul Drain', 'Drain the life force of your opponent to heal yourself.', 150, 'Darkness', 100, 20, 18),
    ('Phantom Strike', 'Summon dark energy to deliver a heavy blow.', 180, 'Darkness', 100, 30, 25);

INSERT INTO
    Effect (skill_id, effect_type, effect_target, effect_value, duration)
VALUES
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Hydration'
        ),
        'Health',
        'Self',
        9,
        0
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Tidal Wave'
        ),
        'Outgoing Damage',
        'Opponent',
        -50,
        1
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Aqua Shield'
        ),
        'Health',
        'Self',
        50,
        0
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Stone Skin'
        ),
        'Incoming Damage',
        'Self',
        -20,
        4
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Whirlwind'
        ),
        'Health',
        'Opponent',
        -5,
        4
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Featherlight'
        ),
        'Outgoing Damage',
        'Self',
        50,
        3
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Healing Light'
        ),
        'Health',
        'Self',
        18,
        0
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Radiant Shield'
        ),
        'Incoming Damage',
        'Self',
        -100,
        1
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Blinding Flash'
        ),
        'Accuracy',
        'Opponent',
        -50,
        1
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Nightmare'
        ),
        'Incoming Damage',
        'Opponent',
        35,
        2
    ),
    (
        (
            SELECT
                skill_id
            FROM
                Skill
            WHERE
                name = 'Soul Drain'
        ),
        'Health',
        'Self',
        12,
        0
    );

-- Lvl 0-1 Items
INSERT INTO
    Item (name, slot, rarity, power, req)
VALUES
    ('Ragged Leather Cap', 'Helmet', 'Common', 6, 0),
    ('Ragged Leather Tunic', 'Chestplate', 'Common', 10, 0),
    ('Ragged Leather Leggings', 'Leggings', 'Common', 8, 0),
    ('Ragged Leather Boots', 'Boots', 'Common', 4, 0),
    ('Dull Wooden Dagger', 'Weapon', 'Common', 15, 0),
    ('Chipped Leather Cap', 'Helmet', 'Rare', 9, 0),
    ('Chipped Leather Tunic', 'Chestplate', 'Rare', 13, 0),
    ('Chipped Leather Leggings', 'Leggings', 'Rare', 11, 0),
    ('Chipped Leather Boots', 'Boots', 'Rare', 7, 0),
    ('Chipped Wooden Dagger', 'Weapon', 'Rare', 18, 0),
    ('Withered Flower Crown', 'Helmet', 'Epic', 14, 0),
    ('Disenchanted Magical Vest', 'Chestplate', 'Epic', 18, 0),
    ('Fallen Noble Leggings', 'Leggings', 'Epic', 16, 0),
    ('Greased Running Shoes', 'Boots', 'Epic', 12, 0),
    ('Wooden Sword', 'Weapon', 'Epic', 23, 0);

INSERT INTO
    Item (name, slot, rarity, power, req, element)
VALUES
    ('Rising Sun', 'Helmet', 'Legendary', 20, 1, 'Light'),
    ('Elusive Temple', 'Chestplate', 'Legendary', 24, 1, 'Earth'),
    ('Raindrops', 'Leggings', 'Legendary', 22, 1, 'Water'),
    ('Windy Landscape', 'Boots', 'Legendary', 18, 1, 'Air'),
    ('Fervour', 'Weapon', 'Legendary', 28, 1, 'Fire');

-- Lvl 2-6 Items
INSERT INTO
    Item (name, slot, rarity, power, req)
VALUES
    ('Leather Cap', 'Helmet', 'Common', 12, 2),
    ('Leather Tunic', 'Chestplate', 'Common', 16, 2),
    ('Leather Leggings', 'Leggings', 'Common', 14, 2),
    ('Leather Boots', 'Boots', 'Common', 10, 2),
    ('Flourished Wooden Sword', 'Weapon', 'Common', 21, 2),
    ('Magical Necklace', 'Helmet', 'Common', 16, 3),
    ('Magical Robes', 'Chestplate', 'Common', 20, 3),
    ('Magical Leggings', 'Leggings', 'Common', 18, 3),
    ('Magical Boots', 'Boots', 'Common', 14, 3),
    ('Stone Sword', 'Weapon', 'Common', 25, 3),
    ('Polished Leather Cap', 'Helmet', 'Rare', 21, 4),
    ('Polished Leather Tunic', 'Chestplate', 'Rare', 25, 4),
    ('Polished Leather Leggings', 'Leggings', 'Rare', 23, 4),
    ('Polished Leather Boots', 'Boots', 'Rare', 19, 4),
    ('Polished Stone Sword', 'Weapon', 'Rare', 30, 4),
    ('Flower Crown', 'Helmet', 'Epic', 25, 5),
    ('Magical Vest', 'Chestplate', 'Epic', 29, 5),
    ('Noble Leggings', 'Leggings', 'Epic', 27, 5),
    ('Running Shoes', 'Boots', 'Epic', 23, 5),
    ('Iron Sword', 'Weapon', 'Epic', 33, 5);

INSERT INTO
    Item (name, slot, rarity, power, req, element)
VALUES
    ('Ablaze Hive', 'Helmet', 'Legendary', 30, 6, 'Fire'),
    ('Divine Creation', 'Chestplate', 'Legendary', 34, 6, 'Light'),
    ('Steel Resolve', 'Leggings', 'Legendary', 32, 6, 'Earth'),
    ('Gentle Stream', 'Boots', 'Legendary', 28, 6, 'Water'),
    ('Tethered Thread', 'Weapon', 'Legendary', 38, 6, 'Air');

-- Lvl 7-12 Items
INSERT INTO
    Item (name, slot, rarity, power, req)
VALUES
    ("Battle-scarred Steel Helmet", 'Helmet', 'Common', 25, 7),
    ("Battle-scarred Steel Chestplate", 'Chestplate', 'Common', 29, 7),
    ("Battle-scarred Steel Leggings", 'Leggings', 'Common', 27, 7),
    ("Battle-scarred Steel Boots", 'Boots', 'Common', 23, 7),
    ('Steel Sword', 'Weapon', 'Common', 30, 7),
    ("Military-grade Helmet", 'Helmet', 'Common', 30, 8),
    ("Military-grade Chestplate", 'Chestplate', 'Common', 34, 8),
    ("Military-grade Leggings", 'Leggings', 'Common', 32, 8),
    ("Military-grade Boots", 'Boots', 'Common', 28, 8),
    ('Damascus-Steel Dagger', 'Weapon', 'Common', 35, 8),
    ('Arcane Iron Helmet', 'Helmet', 'Rare', 35, 9),
    ('Arcane Iron Chestplate', 'Chestplate', 'Rare', 40, 9),
    ('Arcane Iron Leggings', 'Leggings', 'Rare', 38, 9),
    ('Arcane Iron Boots', 'Boots', 'Rare', 34, 9),
    ('Silver Sword', 'Weapon', 'Rare', 45, 9),
    ('Mystic Crown', 'Helmet', 'Rare', 42, 10),
    ('Mystic Robes', 'Chestplate', 'Rare', 48, 10),
    ('Mystic Leggings', 'Leggings', 'Rare', 46, 10),
    ('Mystic Boots', 'Boots', 'Rare', 40, 10),
    ('Reinforced Alloy Dagger', 'Weapon', 'Rare', 50, 10),
    ('Dragon Helm', 'Helmet', 'Epic', 50, 11),
    ('Dragon Armor', 'Chestplate', 'Epic', 55, 11),
    ('Dragon Leggings', 'Leggings', 'Epic', 53, 11),
    ('Dragon Boots', 'Boots', 'Epic', 48, 11),
    ('Golden Dagger', 'Weapon', 'Epic', 60, 11);

INSERT INTO
    Item (name, slot, rarity, power, req, element)
VALUES
    ('Celestial Existence', 'Helmet', 'Legendary', 60, 12, 'Light'),
    ('Infernal Spirit', 'Chestplate', 'Legendary', 65, 12, 'Fire'),
    ('Embrace of Gaia', 'Leggings', 'Legendary', 63, 12, 'Earth'),
    ('Nifty Tsunami', 'Boots', 'Legendary', 58, 12, 'Water'),
    ('Stormbringer', 'Weapon', 'Legendary', 70, 12, 'Air'),
    ('Nightfall', 'Weapon', 'Legendary', 70, 12, 'Darkness');

INSERT INTO
    Item (name, slot, rarity, power, req, effect_type)
VALUES
    ('Inferior Health Potion', 'Potion', 'Common', 20, 1, 'Health'),
    ('Advanced Health Potion', 'Potion', 'Common', 40, 1, 'Health'),
    ('Intermediate Health Potion', 'Potion', 'Common', 60, 4, 'Health'),
    ('Superior Health Potion', 'Potion', 'Common', 90, 4, 'Health'),
    ('Supreme Health Potion', 'Potion', 'Rare', 120, 7, 'Health'),
    ('Master Health Potion', 'Potion', 'Rare', 150, 7, 'Health'),
    ('Grandmaster Health Potion', 'Potion', 'Rare', 200, 10, 'Health'),
    ('Divine Health Potion', 'Potion', 'Rare', 250, 10, 'Health'),
    ('Celestial Health Potion', 'Potion', 'Epic', 300, 13, 'Health'),
    ('Eternal Health Potion', 'Potion', 'Epic', 350, 13, 'Health'),
    ('Immortal Health Potion', 'Potion', 'Epic', 400, 16, 'Health');

INSERT INTO
    Dungeon (name, req)
VALUES
    ('Waterfall of Harmony', 0),
    ('Volcano of Rage', 3),
    ('Sanctuary of Forgotten Lives', 6),
    ('Realm of Illusions', 9),
    ('Abyss of Darkness', 12),
    ('Hamster Sanctuary', 15);

INSERT INTO
    Monster (name, element, health, level, power)
VALUES
    ('Slime', 'Water', 25, 1, 2),
    ('Goblin', 'Earth', 40, 2, 5),
    ('Zombie', 'Earth', 50, 2, 5),
    ('Evil Chicken', 'Air', 35, 3, 8),
    ('Skeleton', 'Darkness', 60, 4, 12),
    ('Orc', 'Earth', 70, 5, 15),
    ('Giant Spider', 'Earth', 80, 6, 18),
    ('Leech', 'Earth', 100, 7, 20),
    ('Undead Soldier', 'Darkness', 120, 8, 20),
    ('Vengeful Ghost', 'Darkness', 140, 9, 24),
    ('Bandit', 'Earth', 160, 10, 28),
    ('Magma Slime', 'Fire', 180, 11, 30),
    ('Naga Fighter', 'Water', 200, 12, 32),
    ('Cursed Bird', 'Air', 210, 13, 33),
    ('Golem', 'Earth', 220, 14, 35),
    ('Happy Chicken', 'Light', 230, 15, 38),
    ('Happy Pig', 'Light', 235, 16, 38),
    ('Angel', 'Light', 240, 17, 40);