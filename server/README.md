(7/6�ǋL)
���[�X�P�[�X�ɉ������g�p���@�̋L��
���i�荞�݌���
�i�荞�݂��Ȃ��ꍇ�Acurl http://13.112.165.3:3000/toilet_pos
[{"tid":1,"longitude":35.68198,"latitude":139.775823,"address":"���{���R���h"},
 {"tid":2,"longitude":35.680414,"latitude":139.773855,"address":" ������"}]

tid��2�̃g�C���̏ꏊ���
curl http://13.112.165.3:3000/toilet_pos?tid=eq.2
[{"tid":2,"longitude":35.680414,"latitude":139.773855,"address":" ������"}]

eq�Ȃǂ̏������ɂ��Ă�http://postgrest.org/en/v5.2/api.html#���Q�Ƃ��Ă��������B

�������Ɉ�v������Update

��{�I�ɂ͍i�荞�݂Ɠ����B
export TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs
(windows�Ȃ�SET)
curl http://13.112.165.3:3000/freq?tid=eq.1 -X PATCH
      -H "Authorization: Bearer $TOKEN"
      -H "Content-Type: application/json"
      -d "{\"freq\": 0}"
��L�́Afreq�e�[�u����tid=1�̃��R�[�h��freq�J������0(��)�ɕύX����R�}���h�B

�������Ɉ�v������DELETE
export TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs
(windows�Ȃ�SET)
curl http://13.112.165.3:3000/freq?tid=eq.1 -X DELETE
      -H "Authorization: Bearer $TOKEN"
      -H "Content-Type: application/json"

��L�́Afreq�e�[�u����tid=1�̃��R�[�h�̍폜

(�ǋL�����܂�)
���T�[�o�\��
- PostgreSQL�APostgreREST�ɂ��\�z
- PostgreSQL��Docker��ɍ\�z�A
-- Docker Run���̃R�}���h�́Asudo docker run --name tutorial -p 5433:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres

PostgreSQL:   https://www.postgresql.jp/document/
PostgreREST:  https://postgrest.org/en/v5.2/index.html

�ȉ��Atodos�Ƃ����e�[�u���ł̗�B�X�L�[�}�͈ȉ�

Column |           Type           | Collation | Nullable |              Default
--------+--------------------------+-----------+----------+-----------------------------------
 id     | integer                  |           | not null | nextval('todos_id_seq'::regclass)
 done   | boolean                  |           | not null | false
 task   | text                     |           | not null |
 due    | timestamp with time zone |           |          |


���e�[�u������f�[�^���擾����
- curl http://13.112.165.3:3000/�e�[�u����
- ���ʂ�json�`���Ŏ擾�ł���B
- ��
-- todos�Ƃ������O�̃e�[�u���̃f�[�^���擾����ꍇ
curl http://13.112.165.3:3000/todos
[{"id":1,"done":true,"task":"finish tutorial 0","due":null},
 {"id":2,"done":true,"task":"pat self on back","due":null}]

-���Ȃ݂�psql�ł̌��ʂ͈ȉ��ɂȂ�

id | done |       task        | due
----+------+-------------------+-----
  1 | t    | finish tutorial 0 |
  2 | t    | pat self on back  |
  

���e�[�u���փf�[�^��}������

- curl http://13.112.165.3:3000/�e�[�u���� -X POST \
     -H "Authorization: Bearer �L�["   \
     -H "Content-Type: application/json" \
     -d '{"�J������1": "�J�����̒l" , "�J������2": "�J�����̒l" }'

- ��Ftodos�e�[�u���ɑ΂��āAdone �J������true, task�J������"leatn how to auth"�ƂȂ�V�����f�[�^��}������ꍇ
curl http://13.112.165.3:3000/todos -X POST \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs"   \
     -H "Content-Type: application/json" \
     -d '{"done":true,"task": "learn how to auth"}'

��{�I�ɂ́A�P�s�ڂ�todos�ƁA4�s�ڂ̃J�������ƃJ�����ɓ����l��ς��邱�Ƃő}������e�[�u���A�f�[�^��ς���
�ق��̕����͔F�؂Ƃ��f�[�^�̃^�C�v�̎w��Ƃ�

���e�[�u���̃f�[�^���X�V����
curl http://13.112.165.3:3000/todos -X PATCH \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs"   \
     -H "Content-Type: application/json" \
     -d '{"id":"1","done":"false"}'

:
�X�V��


#�ȉ���web�T�[�o�ɒ��ڐG��ꍇ�ɂ���
��AWS�̃}�V���ւ̃A�N�Z�X
1. pem�t�@�C�����_�E�����[�h(git��ɒu����)
2. ssh -i "smartse.pem" centos@ec2-13-112-165-3.ap-northeast-1.compute.amazonaws.com

���f�[�^�x�[�X�ւ̒��ڃA�N�Z�X
- PostgreSQL�̐ݒ�����������ĂȂ��̂ŁA�O�����璼�ڂȂ��Ȃ��BDocker���psql�ŃA�N�Z�X
 sudo docker exec -it tutorial psql -U postgres
- �X�L�[�}����api�Ȃ̂ŁA�؂�ւ���
 postgres=# SET search_path = api;
- �e�[�u���ꗗ
 postgres=# \d

���e�[�u���̃X�L�[�}
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


�Z�A�J�E���g���
postgres=# \d account
                 Table "api.account"
  Column  |  Type   | Collation | Nullable | Default
----------+---------+-----------+----------+---------
 hid      | integer |           | not null |
 password | text    |           |          |
Indexes:
    "account_pkey" PRIMARY KEY, btree (hid)

hid�̓��[�U��ID�A�\����B
password�͓K���i�g��Ȃ�

�Z�g�C���̊����
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

tid�̓g�C��ID�A�O����L�[�B
room�͌����ۂ��BTRUE��FALSE������B
sex�̓g�C���̐��ʁB0�j���A1�j�̂݁A2���̂�
fee�͗����B�~�B�����B

�Z�g�C���̎g�p�p�x
postgres=# \d freq
                 Table "api.freq"
 Column |  Type   | Collation | Nullable | Default
--------+---------+-----------+----------+---------
 tid    | integer |           |          |
 freq   | integer |           |          |
tid�̓g�C��ID�A�O����L�[�B
freq��0���g���Ă��Ȃ��i�j�A1�����������i���j�A2���p�Ɂi�ԁj

�Z�g�C���̗\����
postgres=# \d reserve_info
               Table "api.reserve_info"
   Column   |  Type   | Collation | Nullable | Default
------------+---------+-----------+----------+---------
 reserve_id | integer |           |          |
 tid        | integer |           |          |
 hid        | integer |           |          |
reserver_id����L�[�B
tid�̓g�C��ID�Ahid�̓��[�U��ID�B���Ԃ��Ă悢�i1�̃g�C�����l�̐l�������̗\�������Ă悢�j


�Z�g�C���̗\����
postgres=# \d reserve_toilet
               Table "api.reserve_toilet"
   Column    |  Type   | Collation | Nullable | Default
-------------+---------+-----------+----------+---------
 tid         | integer |           | not null |
 current_num | integer |           |          |
 max_num     | integer |           |          |
Indexes:
    "reserve_toilet_pkey" PRIMARY KEY, btree (tid)
tid�̓g�C��ID�A�O����L�[
current_num�����݂̗\�񐔁B
max_num���ő�̗\�񐔁B


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

tid�̓g�C��ID�A��L�[
longitude,latitude�͈ܓx�o�x�B
address�͏Z���Ƃ�����茚�����Ƃ��K�w�Ƃ����F���B

