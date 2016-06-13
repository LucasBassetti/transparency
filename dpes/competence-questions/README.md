##### Qual Credor recebeu mais dinheiro?

``` sql
SELECT ?nome (SUM(xsd:double(?valorTotal)) as ?sumValorTotal) WHERE {
  ?pagamento a loa:Pagamento ;
       loa:valorTotal ?valor ;
       loa:favorece ?credor .
  ?credor rdfs:label ?nome .  
  BIND(REPLACE(?valor, "\\.", "") as ?valor2)
  BIND(REPLACE(?valor2, ",", ".") as ?valor3)
  BIND(REPLACE(?valor3, "R\\$", "", "i") as ?valorTotal)
}
GROUP BY (?nome)
ORDER BY DESC(?sumValorTotal)
```
