●サーバ構造
- PostgreSQL、PostgreRESTにより構築
- PostgreSQLはDocker上に構築、
-- Docker Run時のコマンドは、sudo docker run --name tutorial -p 5433:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres

PostgreSQL:   https://www.postgresql.jp/document/
PostgreREST:  https://postgrest.org/en/v5.2/index.html

以下、todosというテーブルでの例。スキーマは以下

Column |           Type           | Collation | Nullable |              Default
--------+--------------------------+-----------+----------+-----------------------------------
 id     | integer                  |           | not null | nextval('todos_id_seq'::regclass)
 done   | boolean                  |           | not null | false
 task   | text                     |           | not null |
 due    | timestamp with time zone |           |          |


●テーブルからデータを取得する
- curl http://13.112.165.3:3000/テーブル名
- 結果はjson形式で取得できる。
- 例
-- todosという名前のテーブルのデータを取得する場合
curl http://13.112.165.3:3000/todos
[{"id":1,"done":true,"task":"finish tutorial 0","due":null},
 {"id":2,"done":true,"task":"pat self on back","due":null}]

-ちなみにpsqlでの結果は以下になる

id | done |       task        | due
----+------+-------------------+-----
  1 | t    | finish tutorial 0 |
  2 | t    | pat self on back  |
  

●テーブルへデータを挿入する

- curl http://13.112.165.3:3000/テーブル名 -X POST \
     -H "Authorization: Bearer キー"   \
     -H "Content-Type: application/json" \
     -d '{"カラム名1": "カラムの値" , "カラム名2": "カラムの値" }'

- 例：todosテーブルに対して、done カラムにtrue, taskカラムに"leatn how to auth"となる新しいデータを挿入する場合
curl http://13.112.165.3:3000/todos -X POST \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs"   \
     -H "Content-Type: application/json" \
     -d '{"done":true,"task": "learn how to auth"}'

基本的には、１行目のtodosと、4行目のカラム名とカラムに入れる値を変えることで挿入するテーブル、データを変える
ほかの部分は認証とかデータのタイプの指定とか

●テーブルのデータを更新する
curl http://13.112.165.3:3000/todos -X PATCH \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs"   \
     -H "Content-Type: application/json" \
     -d '{"id":"1","done":"false"}'

:
更新中


#以下はwebサーバに直接触る場合について
●AWSのマシンへのアクセス
1. pemファイルをダウンロード(git上に置いた)
2. ssh -i "smartse.pem" centos@ec2-13-112-165-3.ap-northeast-1.compute.amazonaws.com

●データベースへの直接アクセス
- PostgreSQLの設定を書き換えてないので、外部から直接つなげない。Docker上のpsqlでアクセス
 sudo docker exec -it tutorial psql -U postgres
- スキーマ名はapiなので、切り替える
 postgres=# SET search_path = api;
- テーブル一覧
 postgres=# \d

●テーブルのスキーマ
postgres=# \d
               List of relations
 Schema |      Name      |   Type   |  Owner
--------+----------------+----------+----------
 api    | account        | table    | postgres
 api    | environment    | table    | postgres
 api    | freq           | table    | postgres
 api    | reserve_info   | table    | postgres
 api    | reserve_toilet | table    | postgres
 api    | toilet_pos     | table    | postgres

postgres=# \d account
                 Table "api.account"
  Column  |  Type   | Collation | Nullable | Default
----------+---------+-----------+----------+---------
 hid      | integer |           | not null |
 password | text    |           |          |
Indexes:
    "account_pkey" PRIMARY KEY, btree (hid)

postgres=# \d environment
              Table "api.environment"
 Column |  Type   | Collation | Nullable | Default
--------+---------+-----------+----------+---------
 tid    | integer |           | not null |
 room   | boolean |           |          |
 sex    | integer |           |          |
 fee    | integer |           |          |
Indexes:
    "environment_pkey" PRIMARY KEY, btree (tid)

postgres=# \d freq
                 Table "api.freq"
 Column |  Type   | Collation | Nullable | Default
--------+---------+-----------+----------+---------
 tid    | integer |           |          |
 freq   | integer |           |          |

postgres=# \d reserve_info
               Table "api.reserve_info"
   Column   |  Type   | Collation | Nullable | Default
------------+---------+-----------+----------+---------
 reserve_id | integer |           |          |
 tid        | integer |           |          |
 hid        | integer |           |          |

postgres=# \d reserve_toilet
               Table "api.reserve_toilet"
   Column    |  Type   | Collation | Nullable | Default
-------------+---------+-----------+----------+---------
 tid         | integer |           | not null |
 current_num | integer |           |          |
 max_num     | integer |           |          |
Indexes:
    "reserve_toilet_pkey" PRIMARY KEY, btree (tid)

postgres=# \d toilet_pos
                    Table "api.toilet_pos"
  Column   |       Type       | Collation | Nullable | Default
-----------+------------------+-----------+----------+---------
 tid       | integer          |           | not null |
 longitude | double precision |           |          |
 latitude  | double precision |           |          |
 address   | text             |           |          |
Indexes:
    "toilet_pos_pkey" PRIMARY KEY, btree (tid)
