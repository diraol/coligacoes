#-*- coding: utf-8 -*-
#!/usr/bin/python3

import csv
import json

anos = ["1998","2002","2006","2010","2012","2014"]
basename_coligs = "diagrama_cordas"
basename_cabecas = "cabeca_chapa"

def _le_csv_totais(nome_arquivo):
    """Lê o arquivo de 'totais' e retorna uma lista ordenada de partidos e
        uma lista com número de candidaturas.
        A lista de partidos é uma lista ordenada de forma decrescente
        dos partidos que lançaram algum candidato.
        O lista de número de candidaturas tem a mesma ordem da lista
        de partidos."""

    dicionario = {}
    with open(nome_arquivo,"r") as csvfile:
        dictreader = csv.DictReader(csvfile,['lixo','partido','valor'])
        next(dictreader)
        dicionario = {r['partido']:r['valor'] for r in dictreader}

    #Transformando valores de string para inteiros
    dicionario = {partido:int(dicionario[partido]) for partido in dicionario}

    # ordena os partidos de forma decrescente
    partidos = [p for p,v in sorted(dicionario.items(), key=lambda pv: pv[1], reverse=True)]

    candidaturas = []
    for partido in partidos:
        candidaturas.append(dicionario[partido])

    return partidos, candidaturas


def _le_csv_dados_retorna_dicionario(nome_arquivo, lista_ordenada_de_partidos):
    """
        Entrada:
            - Nome do arquivo a ser lido;
            - lista ordenada de partidos (decrescente de acordo com a
                a quantidade de candidaturas lançadas)
        A primeira linha do arquivo csv deve conter
        o cabeçalho, e supõe-se que o cabeçalho da primeira coluna
        está em branco. Além disso, a primeira coluna contém
        os partidos 'cabeça de chapa' daquela linha.

        Saída:
            Matriz de dados já ordenada do maior para o menor partido.
            Lista ordenada complementar de partidos, com os que
                não lançaram candidatura.
        """

    dicionario = {}
    # Monta um dicionário cuja chave é o partido 'cabeça de chapa' e
        # o valor é um outro dicionário, no qual a chave é o partido 'apoiador'
        # e o valor é a quantidade de candidaturas apoiadas.
    with open(nome_arquivo,"r") as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')
        headers = ['cabeca']
        headers.extend(next(csvreader)[1:])
        dictreader = csv.DictReader(csvfile, headers)
        dicionario = {r['cabeca']:r for r in dictreader}

    #Removendo a chave "cabeça", que é redundante
    for cabeca in dicionario:
        del dicionario[cabeca]['cabeca']

    #Transformando valores de string para inteiros
    dicionario = {cabeca:{apoiador:int(dicionario[cabeca][apoiador]) for apoiador in dicionario[cabeca]} for cabeca in dicionario}

    #complementando a lista_ordenada com os partidos que não estão nela (não lançaram candidatos)
    partidos_complementares = []
    for cabeca in dicionario:
        if cabeca not in lista_ordenada_de_partidos:
            partidos_complementares.append(cabeca)

    lista_ordenada_de_partidos.extend(partidos_complementares)
    #criando a matriz final baseada na ordem da lista_ordenada completa
    saida = [[dicionario[cabeca][partido] for partido in lista_ordenada_de_partidos] for cabeca in lista_ordenada_de_partidos]

    return saida, partidos_complementares

def _func_main():
    with open("matriz.json","w") as arq_matriz,\
            open("partidos.json","w") as arq_partidos,\
            open("totais.json","w") as arq_totais:
        matriz = {}
        partidos = {}
        candidaturas = {}

        for ano in anos:
            print("Começando ano: " + ano)
            partidos[ano], candidaturas[ano] = _le_csv_totais(basename_cabecas+ano+".csv")
            matriz[ano], partidos_complementares = _le_csv_dados_retorna_dicionario(basename_coligs+ano+".csv", partidos[ano])

            print("Adicionando partidos complementares")
            for partido in partidos_complementares:
                partidos[ano].append(partido)
                candidaturas[ano].append(0)

        arq_matriz.write(json.dumps(matriz))
        arq_partidos.write(json.dumps(partidos))
        arq_totais.write(json.dumps(candidaturas))

if __name__ == "__main__":
    _func_main()
