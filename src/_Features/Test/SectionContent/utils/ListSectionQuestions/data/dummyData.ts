export const questionsData = {
    "data": [
        {
            "data": {
                "id": "68c3d8d2d5b960e8aeff63ae",
                "missing": true,
                "note": "Referenced test_mcq not found"
            },
            "type": "mcq"
        },
        {
            "data": {
                "id": "68c6853808ce821f25a0bcc0",
                "missing": true,
                "note": "Referenced test_mcq not found"
            },
            "type": "mcq"
        },
        {
            "data": {
                "id": "68c6853808ce821f25a0bcc1",
                "missing": true,
                "note": "Referenced test_mcq not found"
            },
            "type": "mcq"
        },
        {
            "data": {
                "correct_options": [
                    "99c4d7cf-98b6-4220-8f4d-21a8240887bc"
                ],
                "created_by": {
                    "email": "bheema@deloai.com",
                    "exp": 1757687648,
                    "id": "68b915cd8fa29ce01b14741b"
                },
                "difficulty_level": "Hard",
                "explanation": "Write-ahead logging records all changes in a log before applying them, ensuring recovery after crashes. Write-through updates both cache and memory but doesn't guarantee recovery after cache loss. Buffer cache is temporary storage, invalidation removes stale data.\n",
                "explanation_images": [],
                "id": "68c6b1ebb28ce5c4bbab69c8",
                "is_multiple": false,
                "marks": 4,
                "negative_marks": 0,
                "options": [
                    {
                        "images": [],
                        "option_id": "99c4d7cf-98b6-4220-8f4d-21a8240887bc",
                        "value": "- Write-ahead logging (WAL)  "
                    },
                    {
                        "images": [],
                        "option_id": "092e8fa2-6590-45f2-976b-c35abf23afc5",
                        "value": "- Write-through cache  "
                    },
                    {
                        "images": [],
                        "option_id": "803d78e2-7d90-40c6-b87a-3c0e28306a56",
                        "value": "- Buffer cache  "
                    },
                    {
                        "images": [],
                        "option_id": "e285fe5c-3864-4d98-b167-05845fb6619a",
                        "value": "- Cache invalidation  "
                    }
                ],
                "question_images": [],
                "question_text": "In databases, which mechanism ensures durability even if cache data is lost?\n",
                "subtopic": "Caching",
                "tags": [
                    "system-design",
                    "caching",
                    "databases"
                ],
                "time_limit": 60,
                "title": "Write-Ahead Logging vs Cache",
                "topic": "System Design"
            },
            "type": "mcq"
        },
        {
            "data": {
                "correct_options": [
                    "dc90276d-a229-4ae1-9edf-a4a1d41caeae"
                ],
                "created_by": {
                    "email": "bheema@deloai.com",
                    "exp": 1757687648,
                    "id": "68b915cd8fa29ce01b14741b"
                },
                "difficulty_level": "Medium",
                "explanation": "When different caches serve stale or outdated values, it creates a **cache consistency problem**, common in distributed systems. Hit ratio problem is about efficiency, cache warming is about preloading data, and eviction storms are unrelated bursts of cache clearing.\n",
                "explanation_images": [],
                "id": "68c6b1ebb28ce5c4bbab69c9",
                "is_multiple": false,
                "marks": 4,
                "negative_marks": 0,
                "options": [
                    {
                        "images": [],
                        "option_id": "dc90276d-a229-4ae1-9edf-a4a1d41caeae",
                        "value": "- Cache consistency problem  "
                    },
                    {
                        "images": [],
                        "option_id": "2ffc60c7-e473-4a9c-9ed1-dc55256a0f92",
                        "value": "- Cache hit ratio problem  "
                    },
                    {
                        "images": [],
                        "option_id": "0cc58eaa-c56a-41f2-b9ee-22bf0ef6b649",
                        "value": "- Cache warming  "
                    },
                    {
                        "images": [],
                        "option_id": "2e8b285d-1d3c-4896-917e-d44a7a31decb",
                        "value": "- Cache eviction storm  "
                    }
                ],
                "question_images": [],
                "question_text": "In distributed systems, which problem arises when multiple caches hold outdated copies of the same data?\n",
                "subtopic": "Caching",
                "tags": [
                    "system-design",
                    "caching",
                    "distributed-systems"
                ],
                "time_limit": 60,
                "title": "Cache Consistency Challenge",
                "topic": "System Design"
            },
            "type": "mcq"
        },
        {
            "data": {
                "correct_options": [
                    "32e80278-5482-4115-ba12-a0550d9d75fa"
                ],
                "created_by": {
                    "email": "bheema@deloai.com",
                    "exp": 1757687648,
                    "id": "68b915cd8fa29ce01b14741b"
                },
                "difficulty_level": "Hard",
                "explanation": "Non-temporal load/store instructions tell the CPU not to pollute the cache with one-time-use data. Cache invalidation clears entries, write-through is a policy, and shadow cache is not a CPU concept.\n",
                "explanation_images": [],
                "id": "68c6b1ebb28ce5c4bbab69ca",
                "is_multiple": false,
                "marks": 4,
                "negative_marks": 0,
                "options": [
                    {
                        "images": [],
                        "option_id": "32e80278-5482-4115-ba12-a0550d9d75fa",
                        "value": "- Non-temporal load/store  "
                    },
                    {
                        "images": [],
                        "option_id": "a0f1e5d5-3ce8-4401-9596-0c409860cc69",
                        "value": "- Cache invalidation  "
                    },
                    {
                        "images": [],
                        "option_id": "d8e00aab-8c43-4dd5-b811-d558e8bb36cf",
                        "value": "- Write-through  "
                    },
                    {
                        "images": [],
                        "option_id": "411e38c6-37e2-43e0-8061-bf1f15e88e03",
                        "value": "- Shadow cache  "
                    }
                ],
                "question_images": [],
                "question_text": "When data is unlikely to be reused, which CPU instruction hint tells the system to bypass cache?\n",
                "subtopic": "Caching",
                "tags": [
                    "system-design",
                    "caching",
                    "cpu"
                ],
                "time_limit": 60,
                "title": "Non-Temporal Data",
                "topic": "System Design"
            },
            "type": "mcq"
        },
        {
            "data": {
                "correct_order": [
                    "309be402-0dc1-4cd0-a19e-01474dafbf27",
                    "8c3df588-3c24-4aac-b186-d8c6cdc78fb1"
                ],
                "created_by": {
                    "email": "admin@gmail.com",
                    "exp": 1757848315,
                    "id": "68b9150563ec64ab999db7be"
                },
                "difficulty_level": "Easy",
                "explanation": "23",
                "explanation_images": [],
                "id": "68c6b438244e5058443fe47a",
                "is_drag_and_drop": true,
                "items": [
                    {
                        "images": [],
                        "item_id": "8c3df588-3c24-4aac-b186-d8c6cdc78fb1",
                        "value": "2"
                    },
                    {
                        "images": [],
                        "item_id": "309be402-0dc1-4cd0-a19e-01474dafbf27",
                        "value": "1"
                    }
                ],
                "marks": 1,
                "negative_marks": 0,
                "prompt": "aed",
                "question_images": [],
                "subtopic": "Percentages",
                "tags": [],
                "time_limit": 60,
                "title": "asd",
                "topic": "Aptitude"
            },
            "type": "rearrange"
        },
        {
            "data": "{\"_id\": {\"$oid\": \"68c6b4d5eb6666eaca6299ed\"}, \"title\": \"Sum of Digits\", \"topic\": \"Algorithms\", \"subtopic\": \"Sorting\", \"tags\": [\"math\", \"numbers\", \"digits\", \"beginner\", \"implementation\"], \"short_description\": \"Write a program to compute the sum of digits of a given integer. The input may be positive, negative, or zero.\", \"long_description_markdown\": \"### Problem Description\\n\\nYou are given an integer `N`. Your task is to calculate the **sum of its digits**.\\n\\nThe input number may be positive, negative, or zero. If the number is negative, ignore the sign while summing the digits.\\n\\n---\\n\\n### Input Format\\n\\n* A single line containing an integer `N`.\\n\\n### Output Format\\n\\n* A single integer: the sum of digits of `N`.\\n\\n---\\n\\n### Constraints\\n\\n* `-10^1000 \\u2264 N \\u2264 10^1000`\\n* The input number can be very large, so it should be read and processed as a string if necessary.\\n\\n---\\n\", \"difficulty\": \"easy\", \"points\": 100, \"time_limit_ms\": 2000, \"memory_limit_kb\": 65536, \"predefined_boilerplates\": {\"python\": \"def solve():\\n    import sys\\n    input_data = sys.stdin.read().strip()\\n    # TODO: implement logic here\\n    print(0)\\n\\nif __name__ == \\\"__main__\\\":\\n    solve()\\n\", \"javascript\": \"function solve(input) {\\n    // TODO: implement logic here\\n    console.log(0);\\n}\\n\\nconst fs = require(\\\"fs\\\");\\nconst input = fs.readFileSync(0, \\\"utf-8\\\").trim();\\nsolve(input);\\n\", \"java\": \"import java.util.*;\\n\\npublic class Main {\\n    public static void solve(String input) {\\n        // TODO: implement logic here\\n        System.out.println(0);\\n    }\\n\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String input = sc.nextLine().trim();\\n        solve(input);\\n    }\\n}\\n\", \"cpp\": \"#include <bits/stdc++.h>\\nusing namespace std;\\n\\nvoid solve(string input) {\\n    // TODO: implement logic here\\n    cout << 0 << \\\"\\\\n\\\";\\n}\\n\\nint main() {\\n    ios::sync_with_stdio(false);\\n    cin.tie(nullptr);\\n    string input;\\n    if (getline(cin, input)) {\\n        solve(input);\\n    }\\n    return 0;\\n}\\n\", \"c\": \"#include <stdio.h>\\n#include <string.h>\\n\\nvoid solve(char input[]) {\\n    // TODO: implement logic here\\n    printf(\\\"0\\\\n\\\");\\n}\\n\\nint main() {\\n    char input[1100]; // enough for 10^1000 digits\\n    if (scanf(\\\"%s\\\", input) == 1) {\\n        solve(input);\\n    }\\n    return 0;\\n}\\n\"}, \"solution_code\": {\"python\": \"#!/usr/bin/env python3\\nimport sys\\n\\ndef solve():\\n    s = sys.stdin.read().strip()\\n    if not s:\\n        print(0)\\n        return\\n    s = s.strip()\\n    if s.startswith('-'):\\n        s = s[1:]\\n    total = 0\\n    for ch in s:\\n        if ch.isdigit():\\n            total += ord(ch) - ord('0')\\n    print(total)\\n\\nif __name__ == \\\"__main__\\\":\\n    solve()\\n\", \"javascript\": \"#!/usr/bin/env node\\nconst fs = require(\\\"fs\\\");\\n\\nfunction solve(input) {\\n  input = input.trim();\\n  if (input.length === 0) {\\n    console.log(0);\\n    return;\\n  }\\n  if (input[0] === '-') input = input.slice(1);\\n  let sum = 0;\\n  for (let i = 0; i < input.length; ++i) {\\n    const ch = input[i];\\n    if (ch >= '0' && ch <= '9') sum += ch.charCodeAt(0) - '0'.charCodeAt(0);\\n  }\\n  console.log(sum);\\n}\\n\\nconst input = fs.readFileSync(0, \\\"utf8\\\");\\nsolve(input);\\n\", \"java\": \"import java.io.*;\\nimport java.util.*;\\n\\npublic class Main {\\n    public static void main(String[] args) throws Exception {\\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\\n        String s = br.readLine();\\n        if (s == null) {\\n            System.out.println(0);\\n            return;\\n        }\\n        s = s.trim();\\n        if (s.length() == 0) {\\n            System.out.println(0);\\n            return;\\n        }\\n        if (s.charAt(0) == '-') s = s.substring(1);\\n        long sum = 0;\\n        for (int i = 0; i < s.length(); ++i) {\\n            char c = s.charAt(i);\\n            if (Character.isDigit(c)) sum += c - '0';\\n        }\\n        System.out.println(sum);\\n    }\\n}\\n\", \"cpp\": \"#include <bits/stdc++.h>\\nusing namespace std;\\n\\nint main() {\\n    ios::sync_with_stdio(false);\\n    cin.tie(nullptr);\\n    string s;\\n    if (!getline(cin, s)) {\\n        cout << 0 << \\\"\\\\n\\\";\\n        return 0;\\n    }\\n    // trim (simple)\\n    size_t start = s.find_first_not_of(\\\" \\\\t\\\\r\\\\n\\\");\\n    if (start == string::npos) {\\n        cout << 0 << \\\"\\\\n\\\";\\n        return 0;\\n    }\\n    size_t end = s.find_last_not_of(\\\" \\\\t\\\\r\\\\n\\\");\\n    s = s.substr(start, end - start + 1);\\n\\n    if (!s.empty() && s[0] == '-') s = s.substr(1);\\n    long long sum = 0;\\n    for (char c : s) {\\n        if (c >= '0' && c <= '9') sum += c - '0';\\n    }\\n    cout << sum << \\\"\\\\n\\\";\\n    return 0;\\n}\\n\", \"c\": \"#include <stdio.h>\\n#include <string.h>\\n\\nint main() {\\n    // buffer large enough for up to ~1000 digits plus sign\\n    static char input[1105];\\n    if (scanf(\\\"%1100s\\\", input) != 1) {\\n        printf(\\\"0\\\\n\\\");\\n        return 0;\\n    }\\n    int len = strlen(input);\\n    int i = 0;\\n    if (len > 0 && input[0] == '-') i = 1;\\n    long long sum = 0;\\n    for (; i < len; ++i) {\\n        char c = input[i];\\n        if (c >= '0' && c <= '9') sum += (c - '0');\\n    }\\n    printf(\\\"%lld\\\\n\\\", sum);\\n    return 0;\\n}\\n\"}, \"show_solution\": true, \"run_code_enabled\": true, \"submission_enabled\": true, \"show_boilerplates\": true, \"testcase_groups\": [{\"$oid\": \"68c6b4d5eb6666eaca6299ea\"}, {\"$oid\": \"68c6b4d5eb6666eaca6299eb\"}, {\"$oid\": \"68c6b4d5eb6666eaca6299ec\"}], \"published\": true, \"version\": 14, \"authors\": [{\"id\": \"68b9150563ec64ab999db7be\", \"email\": \"admin@gmail.com\", \"exp\": 1757765315}, {\"id\": \"68b9150563ec64ab999db7be\", \"email\": \"admin@gmail.com\", \"exp\": 1757769013}], \"attempt_policy\": {\"max_attempts_per_minute\": 6, \"submission_cooldown_sec\": 2}, \"sample_io\": [{\"input_text\": \"1234\\n\", \"output\": \"10\\n\", \"explanation\": \"The digits are 1, 2, 3, 4. Their sum is 1 + 2 + 3 + 4 = 10.\"}, {\"input_text\": \"-502\\n\", \"output\": \"7\\n\", \"explanation\": \"The negative sign is ignored. The digits are 5, 0, 2. Their sum is 5 + 0 + 2 = 7.\"}, {\"input_text\": \"0\\n\", \"output\": \"0\\n\", \"explanation\": \"The only digit is 0. So the sum is 0.\"}, {\"input_text\": \"1000000000000000000000009\\n\", \"output\": \"10\\n\", \"explanation\": \"The digits are 1 followed by many zeros and ending with 9. Their sum is 1 + 0 + ... + 0 + 9 = 10. This shows how the solution should handle very large inputs.\"}], \"allowed_languages\": [\"python\", \"cpp\", \"java\", \"javascript\", \"c\"], \"created_at\": {\"$date\": 1757764002206}, \"updated_at\": {\"$date\": 1757852885615}}",
            "type": "coding"
        }
    ],
    "message": "Questions fetched",
    "success": true
};